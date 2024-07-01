const fs = require('fs');
const moment = require('moment');
const { exec } = require('child_process');
const Trame = require('../epic-api/models/trame');
const logger = require('../utils/logger');

module.exports = function trameMonitor() {
  logger.debug('Trame monitor');
  // kill the trame instance process and delete trame from DB after deleteGracePeriod
  const deleteGracePeriod = moment().subtract(process.env.TRAME_DELETE_GRACE_PERIOD, 'hours');
  Trame.find({ 'updated': { '$lte': deleteGracePeriod } }).then(trames => {
    trames.forEach((trame) => {
      logger.debug(`Delete trame ${trame}`);
      // kill the trame process
      exec(`kill -9 ${trame.pid}`, (error, stdout, stderr) => {
        if (error) {
          logger.error(error.message);
        }
        if (stderr) {
          logger.error(stderr);
        }
      });
      // delete from database
      Trame.deleteOne({ ipAddress: trame.ipAddress }, (err) => {
        if (err) {
          logger.info(`Failed to delete trame `);
        }
      });
    });
  });
}
