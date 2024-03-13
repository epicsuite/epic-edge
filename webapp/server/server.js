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
const indexRouter = require('./epic-api/routes/index');
const dbBackup = require('./crons/dbBackup');
const dbBackupClean = require('./crons/dbBackupClean');

const app = express();
app.use(cors({ origin: '*' }));
// Helmet helps to secure Express apps by setting various HTTP headers.
app.use(helmet());
app.use(express.json());
app.use(fileUpload({
  // max size: 5G
  limits: { fileSize: process.env.FILEUPLOAD_MAX_SIZE_BYTES },
  abortOnLimit: true,
  debug: false,
  useTempFiles: true,
  tempFileDir: process.env.FILEUPLOAD_TMP_DIR
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
app.use('/datasets', express.static(process.env.DATASET_HOME, { dotfiles: 'allow' }));
app.use('/sessions', express.static(process.env.SESSION_HOME, { dotfiles: 'allow' }));

// Serving React as static files in Express and redirect url path to React client app
if (process.env.NODE_ENV === 'prod') {
  app.use(express.static(process.env.UI_BUILD_PATH));
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.env.UI_BUILD_PATH, 'index.html'));
  });
} else {
  // cron jobs
  // backup nmdcepic DB every day at 10pm
  cron.schedule(process.env.CRON_DB_BACKUP, () => {
    dbBackup();
  });
  // delete older DB backups every day at 12am
  cron.schedule(process.env.CRON_DB_BACKUP_CLEAN, () => {
    dbBackupClean();
  });
}

const runApp = async () => {
  try {
    // Connect to MongoDB
    mongoose.set('strictQuery', false);
    mongoose
      .connect(
        process.env.MONGO_URI,
      );
    logger.info(`Successfully connected to database ${process.env.MONGO_URI}`);
    // start server
    app.listen(process.env.PORT, () => logger.info(`HTTP ${process.env.NODE_ENV} server up and running on port ${process.env.PORT} !`));
  } catch (err) {
    logger.error(err);
  }
};

runApp();
