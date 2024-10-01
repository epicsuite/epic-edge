require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const cron = require('node-cron');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./epic-api/swagger/swaggerSpec');
const logger = require('./utils/logger');
const indexRouter = require('./indexRouter');
const trameMonitor = require('./crons/trameMonitor');
const uploadMonitor = require('./crons/uploadMonitor');
const workflowMonitor = require('./crons/cromwellWorkflowMonitor');
const projectMonitor = require('./crons/projectMonitor');
const projectStatusMonitor = require('./crons/projectStatusMonitor');
const dbBackup = require('./crons/dbBackup');
const dbBackupClean = require('./crons/dbBackupClean');
const config = require('./config');

const app = express();
app.use(cors({ origin: '*' }));
// Helmet helps to secure Express apps by setting various HTTP headers.
// app.use(helmet());
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json());
app.use(fileUpload({
  // max size: 5G
  limits: { fileSize: config.FILE_UPLOADS.MAX_FILE_SIZE_BYTES },
  abortOnLimit: true,
  debug: false,
  useTempFiles: true,
  tempFileDir: config.IO.UPLOADED_FILES_TEMP_DIR
}));
// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());

// Passport middleware
app.use(passport.initialize());
// Passport config
require('./edge-api/utils/passport')(passport);

// APIs
app.use('/api', indexRouter);
// API docs
app.use('/api-ui', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: false }));

// Serving static files in Express
app.use('/projects', express.static(config.IO.PROJECT_BASE_DIR, { dotfiles: 'allow' }));
app.use('/uploads', express.static(config.IO.UPLOADED_FILES_DIR));
app.use('/publicdata', express.static(config.IO.PUBLIC_BASE_DIR));
app.use('/docs', express.static(config.APP.DOCS_BASE_DIR, { dotfiles: 'allow' }));

// Serving React as static files in Express and redirect url path to React client app
if (config.NODE_ENV === 'production') {
  app.use(express.static(config.CLIENT.BUILD_DIR));
  app.get('*', (req, res) => {
    res.sendFile(path.join(config.CLIENT.BUILD_DIR, 'index.html'));
  });
} else {
  // cron jobs
  // monitor trames every day at 4am
  cron.schedule(config.CRON.SCHEDULES.TRAME_MONITOR, () => {
    trameMonitor();
  });
  // monitor workflow requests on every 2 minutes
  cron.schedule(config.CRON.SCHEDULES.CROMWELL_WORKFLOW_MONITOR, () => {
    workflowMonitor();
  });
  // monitor uploads every day at midnight
  cron.schedule(config.CRON.SCHEDULES.FILE_UPLOAD_MONITOR, () => {
    uploadMonitor();
  });
  // monitor project status on every 1 minute
  cron.schedule(config.CRON.SCHEDULES.PROJECT_STATUS_MONITOR, () => {
    projectStatusMonitor();
  });
  // monitor project deletion every day at 10pm
  cron.schedule(config.CRON.SCHEDULES.PROJECT_DELETION_MONITOR, () => {
    projectMonitor();
  });
  // backup nmdcedge DB every day at 10pm
  cron.schedule(config.CRON.SCHEDULES.DATABASE_BACKUP_CREATOR, () => {
    dbBackup();
  });
  // delete older DB backups every day at 12am
  cron.schedule(config.CRON.SCHEDULES.DATABASE_BACKUP_PRUNER, () => {
    dbBackupClean();
  });
}


const runApp = async () => {
  try {
    // Connect to MongoDB
    const db = `mongodb://${config.DATABASE.SERVER_HOST}:${config.DATABASE.SERVER_PORT}/${config.DATABASE.NAME}`;
    mongoose.set('strictQuery', false);
    mongoose
      .connect(
        db
      );
    logger.info(`Successfully connected to database ${db}`);
    // start server
    app.listen(config.APP.SERVER_PORT, () => logger.info(`HTTP ${config.NODE_ENV} server up and running on port ${config.APP.SERVER_PORT} !`));
  } catch (err) {
    logger.error(err);
  }
};

runApp();
