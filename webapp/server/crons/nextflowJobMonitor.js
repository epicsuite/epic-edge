const Project = require('../edge-api/models/project');
const Job = require('../edge-api/models/job');
const { abortJob, updateJobStatus } = require('../utils/nextflowWorkflow');
const logger = require('../utils/logger');

module.exports = function nextflowJobMonitor() {
  logger.debug('nextflow monitor');

  // only process one job at each time based on job updated time
  Job.find({ 'queue': 'nextflow', 'status': { $in: ['Submitted', 'Running'] } }).sort({ updated: 1 }).then(jobs => {
    const job = jobs[0];
    if (!job) {
      logger.debug('No nextflow job to process');
      return;
    }
    logger.debug(`nextflow ${job}`);
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
        Job.deleteOne({ project: job.project }, (err) => {
          if (err) {
            logger.error(`Failed to delete job from DB ${job.project}:${err}`);
          }
        });
      }
    });
  });
};

