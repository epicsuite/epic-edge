const Project = require('../edge-api/models/project');
const CromwellJob = require('../edge-api/models/job');
const { abortJob, updateJobStatus } = require('../edge-api/utils/workflow');
const logger = require('../utils/logger');


module.exports = function cromwellMonitor() {
  logger.debug('cromwell monitor');

  // only process one job at each time based on job updated time
  CromwellJob.find({ 'queue': 'cromwell', 'status': { $in: ['Submitted', 'Running'] } }).sort({ updated: 1 }).then(jobs => {
    const job = jobs[0];
    if (!job) {
      logger.debug('No cromwell job to process');
      return;
    }
    logger.debug(`cromwell ${job}`);
    // find related project
    Project.findOne({ 'code': job.project }).then(proj => {
      if (proj) {
        if (proj.status === 'delete') {
          // abort job
          abortJob(job);
        } else {
          updateJobStatus(job, proj);
        }
      } else {
        // delete from database
        CromwellJob.deleteOne({ project: job.project }, (err) => {
          if (err) {
            logger.error(`Failed to delete job from DB ${job.project}:${err}`);
          }
        });
      }
    });
  });
};

