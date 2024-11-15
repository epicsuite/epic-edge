/* eslint-disable no-unreachable */
const fs = require('fs');
const ejs = require('ejs');
const Job = require('../edge-api/models/job');
const { workflowList, generateWorkflowResult } = require('./workflow');
const { write2log, execCmd } = require('./common');
const logger = require('./logger');
const config = require('../config');

const generateInputs = async (projHome, projectConf, proj) => {
  // projectConf: project conf.js
  // workflowList in utils/workflow
  const workflowSettings = workflowList[projectConf.workflow.name];
  const template = String(fs.readFileSync(`${config.NEXTFLOW.TEMPLATE_DIR}/${projectConf.category}/${workflowSettings.config_tmpl}`));
  const params = { ...projectConf.workflow.input, outdir: `${projHome}/${workflowSettings.outdir}`, project: proj.name };
  // render input template and write to nextflow_params.json
  const inputs = ejs.render(template, params);
  await fs.promises.writeFile(`${projHome}/nextflow.config`, inputs);
  return true;
};

// submit workflow to cromwell through api
const submitWorkflow = (proj, projectConf, inputsize) => {
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`;
  const log = `${projHome}/nextflow.log`;
  const report = `${projHome}/nextflow_report.html`;
  const now = new Date();
  const dateString = now.toISOString().replace(/[:.]/g, '_');
  const jobId = `edge-${proj.code}-${dateString}`;
  const cmd = `cd ${config.NEXTFLOW.WORK_DIR} && nextflow -c ${projHome}/nextflow.config -bg -q -log ${log} run ${config.NEXTFLOW.WORKFLOW_DIR}/${workflowList[projectConf.workflow.name].nextflow_main} -name ${jobId} -work-dir ${config.NEXTFLOW.WORK_DIR} -with-report ${report}`;
  write2log(log, cmd);
  const ret = execCmd(cmd);
  write2log(log, ret.message);
  if (ret === -1) {
    logger.error(`Failed to submit workflow to Nextflow: ${ret.message}`);
    proj.status = 'failed';
    proj.updated = Date.now();
    proj.save();
  } else {
    const newJob = new Job({
      id: jobId,
      project: proj.code,
      type: proj.type,
      inputsize,
      queue: 'nextflow',
      status: 'Submitted'
    });
    newJob.save().catch(err => { logger.error('falied to save to nextflowjob: ', err); });
    proj.status = 'submitted';
    proj.updated = Date.now();
    proj.save();
  }
};

const abortJob = (proj, job) => {
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`;
  const log = `${projHome}/${proj.code}/nextflow.log`;
  const cmd = `${config.NEXTFLOW.WRAPPER} -work-dir ${config.NEXTFLOW.WORK_DIR} -actiotn abort -job-name ${job.id}`;
  write2log(log, cmd);
  const ret = execCmd(cmd);
  write2log(log, ret.message);
  if (ret === -1) {
    logger.error(`Failed to abort nextflow job: ${ret.message}`);
  } else {
    // update job status
    job.status = 'Aborted';
    job.updated = Date.now();
    job.save();
    write2log(log, 'Nextflow job aborted.');
  }
};

const getJobMetadata = (job) => {
  // get job metadata through api
  logger.info(job);
};

const getWorkflowStats = () => {
};

const generateRunStats = (project) => {
  logger.info(project);
  getWorkflowStats();
};

const updateJobStatus = (job, proj) => {
  // get job status
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`;
  const log = `${projHome}/log.txt`;
  const cmd = `${config.NEXTFLOW.WRAPPER} -work-dir ${config.NEXTFLOW.WORK_DIR} -actiotn abort -job-name ${job.id}`;
  write2log(log, cmd);
  const ret = execCmd(cmd);
  write2log(log, ret.message);
  let newStatus = job.status;
  if (ret === -1) {
    logger.error(`Failed to get nextflow job status: ${ret.message}`);
    newStatus = 'failed';
  } else {
    // find job status
  }

  // update project status
  if (job.status !== newStatus) {
    let status = null;
    if (newStatus === 'Running') {
      status = 'running';
    } else if (newStatus === 'Succeeded') {
      // generate result.json
      logger.info('generate workflow result.json');
      try {
        generateWorkflowResult(proj);
      } catch (e) {
        job.status = newStatus;
        job.updated = Date.now();
        job.save();
        // result not as expected
        proj.status = 'failed';
        proj.updated = Date.now();
        proj.save();
        throw e;
      }
      status = 'complete';
    } else if (newStatus === 'Failed') {
      status = 'failed';
    } else if (newStatus === 'Aborted') {
      status = 'in queue';
    }
    proj.status = status;
    proj.updated = Date.now();
    proj.save();
    write2log(`${process.env.PROJECT_HOME}/${job.project}/log.txt`, `Nextflow job status: ${newStatus}`);
  }
  // update job even its status unchanged. We need set new updated time for this job.
  if (newStatus === 'Aborted') {
    // delete job
    Job.deleteOne({ project: proj.code }, (err) => {
      if (err) {
        logger.error(`Failed to delete job from DB ${proj.code}:${err}`);
      }
    });
  } else {
    job.status = newStatus;
    job.updated = Date.now();
    job.save();
    // getJobMetadata(job);
  }
};

module.exports = {
  generateInputs,
  submitWorkflow,
  generateRunStats,
  abortJob,
  getJobMetadata,
  updateJobStatus,
};
