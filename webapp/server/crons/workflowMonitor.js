const fs = require('fs');
const Project = require('../edge-api/models/project');
const CromwellJob = require('../edge-api/models/job');
const common = require('../utils/common');
const logger = require('../utils/logger');
const { workflowList, generateWDL, generateInputs, submitWorkflow, findInputsize } = require('../utils/workflow');

module.exports = function workflowMonitor() {
  logger.debug('workflow monitor');
  // only process one job at each time based on job updated time
  CromwellJob.find({ 'status': { $in: ['Submitted', 'Running'] } }).sort({ updated: 1 }).then(jobs => {
    // submit request only when the current cromwell running jobs less than the max allowed jobs
    if (jobs.length >= process.env.MAX_CROMWELL_JOBS) {
      return;
    }
    // get current running/submitted projects' input size
    let jobInputsize = 0;
    jobs.forEach(job => {
      jobInputsize += job.inputSize;
    });
    // only process one request at each time
    Project.find({ 'status': 'in queue' }).sort({ updated: 1 }).then(async projs => {
      const proj = projs[0];
      if (!proj) {
        logger.debug('No workflow request to process');
        return;
      }
      // parse conf.json
      const projHome = `${process.env.PROJECT_HOME}/${proj.code}`;
      const projectConf = JSON.parse(fs.readFileSync(`${projHome}/conf.json`));

      // check input size
      const inputsize = await findInputsize(projectConf);
      if (inputsize > process.env.MAX_CROMWELL_JOBS_INPUTSIZE) {
        logger.debug(`Project ${proj.code} input size exceeded the limit.`);
        // fail project
        proj.status = 'failed';
        proj.updated = Date.now();
        proj.save();
        common.write2log(`${process.env.PROJECT_HOME}/${proj.code}/log.txt`, 'input size exceeded the limit.');
        return;
      }
      if ((jobInputsize + inputsize) > process.env.MAX_CROMWELL_JOBS_INPUTSIZE) {
        logger.debug('Cromwell is busy.');
        return;
      }

      logger.info(`Processing workflow request: ${proj.code}`);
      // set project status to 'processing'
      proj.status = 'processing';
      proj.updated = Date.now();
      proj.save().then(() => {
        common.write2log(`${process.env.PROJECT_HOME}/${proj.code}/log.txt`, 'Generate WDL and inputs json');
        logger.info('Generate WDL and inputs json');
        // process request
        // create output directory
        fs.mkdirSync(`${projHome}/${workflowList[projectConf.workflow.name].outdir}`, { recursive: true });
        // in case cromwell needs permission to write to the output directory
        fs.chmodSync(`${projHome}/${workflowList[projectConf.workflow.name].outdir}`, '777');
        // get workflow system settings
        const workflowConf = JSON.parse(fs.readFileSync(process.env.WORKFLOW_CONF));
        // generate pipeline.wdl and inputs.json
        // eslint-disable-next-line no-async-promise-executor
        const promise1 = new Promise(async (resolve, reject) => {
          const wdl = await generateWDL(projHome, projectConf);
          if (wdl) {
            resolve(proj);
          } else {
            reject(new Error(`Failed to generate WDL for project ${proj.code}`));
          }
        });
        // eslint-disable-next-line no-async-promise-executor
        const promise2 = new Promise(async (resolve, reject) => {
          const inputs = await generateInputs(projHome, projectConf, workflowConf, proj);
          if (inputs) {
            resolve(proj);
          } else {
            reject(new Error(`Failed to generate inputs.json for project ${proj.code}`));
          }
        });

        Promise.all([promise1, promise2]).then(() => {
          // submit workflow to cromwell
          common.write2log(`${process.env.PROJECT_HOME}/${proj.code}/log.txt`, 'submit workflow to cromwell');
          logger.info('submit workflow to cromwell');
          submitWorkflow(proj, projectConf, inputsize);
        }).catch((err) => {
          proj.status = 'failed';
          proj.updated = Date.now();
          proj.save();
          common.write2log(`${process.env.PROJECT_HOME}/${proj.code}/log.txt`, err);
          logger.error(err);
        });
      }).catch(err => {
        proj.status = 'failed';
        proj.updated = Date.now();
        proj.save();
        common.write2log(`${process.env.PROJECT_HOME}/${proj.code}/log.txt`, err);
        logger.error(err);
      });
    });
  });
};

