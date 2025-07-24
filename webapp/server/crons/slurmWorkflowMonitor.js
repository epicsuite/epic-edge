const fs = require('fs');
const Project = require('../edge-api/models/project');
const Job = require('../edge-api/models/job');
const common = require('../utils/common');
const logger = require('../utils/logger');
const { slurmWorkflows, workflowList } = require('../utils/workflow');
const { generateInputs, submitWorkflow } = require('../utils/slurm');

const config = require('../config');

module.exports = async function slurmWorkflowMonitor() {
  logger.debug('slurm workflow monitor');
  try {
    // only process one job at each time based on job updated time
    const jobs = await Job.find({ 'queue': 'slurm', 'status': { $in: ['Submitted', 'Running'] } }).sort({ updated: 1 });
    // submit request only when the current slurm running jobs less than the max allowed jobs
    if (jobs.length >= config.SLURM.NUM_JOBS_MAX) {
      return;
    }
    // get current running/submitted projects' input size
    let jobInputsize = 0;
    jobs.forEach(job => {
      jobInputsize += job.inputSize;
    });
    // only process one request at each time
    const projs = await Project.find({ 'type': { $in: slurmWorkflows }, 'status': 'in queue' }).sort({ updated: 1 });
    const proj = projs[0];
    if (!proj) {
      logger.debug('No slurm workflow request to process');
      return;
    }
    // parse conf.json
    const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`;
    const projectConf = JSON.parse(fs.readFileSync(`${projHome}/conf.json`));

    // check input size
    const inputsize = await common.findInputsize(projectConf);
    if (inputsize > config.SLURM.JOBS_INPUT_MAX_SIZE_BYTES) {
      logger.debug(`Project ${proj.code} input size exceeded the limit.`);
      // fail project
      proj.status = 'failed';
      proj.updated = Date.now();
      proj.save();
      common.write2log(`${config.IO.PROJECT_BASE_DIR}/${proj.code}/log.txt`, 'input size exceeded the limit.');
      return;
    }
    if ((jobInputsize + inputsize) > config.SLURM.JOBS_INPUT_MAX_SIZE_BYTES) {
      logger.debug('slurm is busy.');
      return;
    }

    logger.info(`Processing workflow request: ${proj.code}`);
    // set project status to 'processing'
    proj.status = 'processing';
    proj.updated = Date.now();
    await proj.save();
    // process request
    // create output directory
    fs.mkdirSync(`${projHome}/${workflowList[projectConf.workflow.name].outdir}`, { recursive: true });
    // in case slurm needs permission to write to the output directory
    fs.chmodSync(`${projHome}/${workflowList[projectConf.workflow.name].outdir}`, '777');
    common.write2log(`${config.IO.PROJECT_BASE_DIR}/${proj.code}/log.txt`, 'Generate workflow input');
    logger.info('Generate workflow input');
    // generate workflow input
    const isGood = await generateInputs(projHome, projectConf, proj);
    if (!isGood) {
      throw Error('Failed to generate inputs');
    }
    // submit workflow to slurm
    common.write2log(`${config.IO.PROJECT_BASE_DIR}/${proj.code}/log.txt`, 'submit workflow to slurm');
    logger.info('submit workflow to slurm');
    submitWorkflow(proj, projectConf, inputsize);
    logger.info('Done workflow submission');
  } catch (err) {
    logger.error(`slurmWorkflowMonitor failed:${err}`);
  }
};
