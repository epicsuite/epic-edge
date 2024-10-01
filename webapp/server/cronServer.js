const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const logger = require('./utils/logger');
const dbBackup = require('./crons/dbBackup');
const dbBackupClean = require('./crons/dbBackupClean');
const trameMonitor = require('./crons/trameMonitor');
const config = require('./config');

const app = express();
app.use(express.json());

// allow cross-origin requests
app.use(cors());

// backup nmdcedge DB every day at 10pm
cron.schedule(config.CRON.SCHEDULES.DATABASE_BACKUP_CREATOR, () => {
  dbBackup();
});
// delete older DB backups every day at 12am
cron.schedule(config.CRON.SCHEDULES.DATABASE_BACKUP_PRUNER, () => {
  dbBackupClean();
});
// monitor trames every day at 4am
cron.schedule(config.CRON.SCHEDULES.TRAME_MONITOR, () => {
  trameMonitor();
});

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
    app.listen(config.CRON.SERVER_PORT, () => logger.info(`HTTP CRON server up and running on port ${config.CRON.SERVER_PORT} !`));
  } catch (err) {
    logger.error(err);
  }
};

runApp();
