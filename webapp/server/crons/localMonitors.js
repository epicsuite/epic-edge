const fs = require('fs');
const Project = require('../edge-api/models/project');
const Job = require('../edge-api/models/job');
const common = require('../utils/common');
const logger = require('../utils/logger');
const { abortJob, updateJobStatus } = require('../utils/local');
const { localWorkflows, workflowList } = require('../utils/workflow');

const config = require('../config');

const localWorkflowMonitor = async () => {
  logger.debug('Local workflow monitor');
  try {
    // only process one job at each time based on job updated time
    const jobs = await Job.find({ 'queue': 'local', 'status': { $in: ['Submitted', 'Running'] } }).sort({ updated: 1 });
    // submit request only when the current local running jobs less than the max allowed jobs
    if (jobs.length >= config.LOCAL.NUM_JOBS_MAX) {
      logger.debug('Local server is busy.');
      return;
    }
    // only process one request at each time
    const projs = await Project.find({ 'type': { $in: localWorkflows }, 'status': 'in queue' }).sort({ updated: 1 });
    const proj = projs[0];
    if (!proj) {
      logger.debug('No local request to process');
      return;
    }
    logger.info(`Processing local request: ${proj.code}`);
    // process request
    const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`;
    const projectConf = JSON.parse(fs.readFileSync(`${projHome}/conf.json`));
    // create output directory
    const outDir = `${projHome}/${workflowList[projectConf.workflow.name].outdir}`;
    fs.mkdirSync(outDir, { recursive: true });
    // in case local needs permission to write to the output directory
    fs.chmodSync(outDir, '777');
    const runTime = `${projHome}/run_time.txt`;
    let cmd = `date > ${runTime}`;
    const log = `${projHome}/log.txt`;

    if (proj.type === 'assayDesign') {
      logger.info('Run bioAI...');
      // create bioaiConf.json
      const conf = `${projHome}/bioaiConf.json`;
      fs.writeFileSync(conf, JSON.stringify({ pipeline: 'bioai', params: { ...projectConf.workflow.input, ...projectConf.genomes } }));
      cmd += ` && ${config.WORKFLOW.BIOAI_EXEC} -i ${conf} -o ${outDir}`;
    }
    cmd += `  && date >> ${runTime} &`;
    logger.info(cmd);
    // run local
    const pid = common.spawnCmd(cmd, log);
    // run local
    if (pid) {
      logger.info(`Started local job with PID: ${pid}`);
      const newJob = new Job({
        pid: pid + 1,
        id: `local-${proj.code}`,
        project: proj.code,
        type: proj.type,
        queue: 'local',
        status: 'Running'
      });
      newJob.save();
      proj.status = 'running';
      proj.updated = Date.now();
      proj.save();
    } else {
      logger.error('Failed to start local job.');
      proj.status = 'failed';
      proj.updated = Date.now();
      proj.save();
    }
  } catch (err) {
    logger.error(`localMonitor failed:${err}`);
  }
};

const localJobMonitor = async () => {
  logger.debug('local job monitor');
  try {
    // only process one job at each time based on job updated time
    const jobs = await Job.find({ 'queue': 'local', 'status': { $in: ['Submitted', 'Running'] } }).sort({ updated: 1 });
    const job = jobs[0];
    if (!job) {
      logger.debug('No local job to process');
      return;
    }
    logger.debug(`local job ${job.id}`);
    // find related project
    const proj = await Project.findOne({ 'code': job.project });
    if (proj) {
      if (proj.status === 'delete') {
        // abort job
        abortJob(job);
      } else {
        updateJobStatus(job, proj);
      }
    } else {
      // abort job
      abortJob(job);
      // delete from database
      Job.deleteOne({ project: job.project }, (err) => {
        if (err) {
          logger.error(`Failed to delete job from DB ${job.project}:${err}`);
        }
      });
    }
  } catch (err) {
    logger.error(`localJobMonitor failed:${err}`);
  }
};

module.exports = {
  localWorkflowMonitor,
  localJobMonitor,
};
