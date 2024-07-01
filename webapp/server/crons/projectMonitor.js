const fs = require('fs');
const moment = require('moment');
const Project = require('../edge-api/models/project');
const CromwellJob = require('../edge-api/models/job');
const logger = require('../utils/logger');

module.exports = function projectMonitor() {
  logger.debug('project monitor');

  // delete file after deleteGracePeriod
  const deleteGracePeriod = moment().subtract(process.env.PROJECT_DELETE_GRACE_PERIOD, 'days');
  Project.find({ 'status': 'delete', 'updated': { '$lte': deleteGracePeriod } }).then(projs => {
    let i;
    for (i = 0; i < projs.length; i += 1) {
      const { code } = projs[i];
      logger.info(`delete project: ${code}`);
      const path = `${process.env.PROJECT_HOME}/${code}`;
      // delete directory recursively
      try {
        fs.rmdirSync(path, { recursive: true });
        logger.info(`deleted ${path}`);
      } catch (err) {
        logger.error(`Failed to delete ${path}:${err}`);
        return;
      }
      // delete from database
      Project.deleteOne({ code }, (err) => {
        if (err) {
          logger.error(`Failed to delete project from DB ${code}:${err}`);
        }
      });
      CromwellJob.deleteOne({ project: code }, (err) => {
        if (err) {
          logger.error(`Failed to delete job from DB ${code}:${err}`);
        }
      });
    }
  });
};
