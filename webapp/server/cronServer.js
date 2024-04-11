const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const logger = require('./utils/logger');
const dbBackup = require('./crons/dbBackup');
const dbBackupClean = require('./crons/dbBackupClean');
const trameMonitor = require('./crons/trameMonitor');

const app = express();
app.use(express.json());

// allow cross-origin requests
app.use(cors());

// backup nmdcedge DB every day at 10pm
cron.schedule(process.env.CRON_DB_BACKUP, () => {
  dbBackup();
});
// delete older DB backups every day at 12am
cron.schedule(process.env.CRON_DB_BACKUP_CLEAN, () => {
  dbBackupClean();
});
// monitor trames every day at 4am
cron.schedule(process.env.CRON_TRAME_MONITOR, () => {
  trameMonitor();
});

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
    app.listen(process.env.CRON_PORT, () => logger.info(`HTTP CRON server up and running on port ${process.env.CRON_PORT} !`));
  } catch (err) {
    logger.error(err);
  }
};

runApp();
