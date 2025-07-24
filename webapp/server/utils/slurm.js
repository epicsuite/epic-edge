/* eslint-disable no-unreachable */
const fs = require('fs');
const YAML = require('json-to-pretty-yaml');
const ejs = require('ejs');
const csv = require('csvtojson');
const Job = require('../edge-api/models/job');
const Upload = require('../edge-api/models/upload');
const { workflowList, linkUpload, generateWorkflowResult } = require('./workflow');
const { write2log, execCmd, sleep } = require('./common');
const logger = require('./logger');
const config = require('../config');

const generateInputs = async (projHome, projectConf, proj) => {
  const log = `${projHome}/log.txt`;
  // projectConf: project conf.js
  // workflowList in utils/workflow
  // validate input csv
  const csvFile = `${projHome}/${projectConf.workflow.input.workflowInput.csvFile}`;
  const outdir = `${projHome}/${workflowList[projectConf.workflow.name].outdir}`;
  // Async / await usage
  const jsonArray = await csv({
    // rename headers to ignore potentially erroneous user-entered headers
    noheader: false,
    headers: ['file_1', 'file_2', 'description']
  }).fromFile(csvFile);

  // validate inputs and replace with real file paths
  let currRow = 0;
  let validInput = true;
  let errMsg = '';
  const fq1s = [];
  const fq2s = [];
  let newCsv = 'filepath_1,filepath_2,description\n';
  for (let i = 0; i < jsonArray.length; i += 1) {
    currRow += 1;
    const [folder1, upload1] = jsonArray[i].file_1.split(/\//);
    // find uploaded file
    // eslint-disable-next-line no-await-in-loop
    const file1 = await Upload.findOne({ folder: { $eq: folder1 }, name: { $eq: upload1 }, status: { $ne: 'delete' } });
    if (!file1) {
      validInput = false;
      errMsg += `ERROR: Row ${currRow}: file ${jsonArray[i].file_1} not found.\n`;
    } else {
      // add file link to input directory
      // eslint-disable-next-line no-await-in-loop
      const fqlink1 = await linkUpload(`${config.IO.UPLOADED_FILES_DIR}/${file1.code}`, projHome);
      fq1s.push(fqlink1);
      newCsv += `${fqlink1},`;
    }
    const [folder2, upload2] = jsonArray[i].file_2.split(/\//);
    // find uploaded file
    // eslint-disable-next-line no-await-in-loop
    const file2 = await Upload.findOne({ folder: { $eq: folder2 }, name: { $eq: upload2 }, status: { $ne: 'delete' } });
    if (!file2) {
      validInput = false;
      errMsg += `ERROR: Row ${currRow}: file ${jsonArray[i].file_2} not found.\n`;
    } else {
      // add file link to input directory
      // eslint-disable-next-line no-await-in-loop
      const fqlink2 = await linkUpload(`${config.IO.UPLOADED_FILES_DIR}/${file2.code}`, projHome);
      fq2s.push(fqlink2);
      newCsv += `${fqlink2},`;
    }
    newCsv += `${jsonArray[i].description}\n`;
  }
  if (!validInput) {
    logger.error('Validation failed.');
    logger.error(errMsg);
    write2log(log, 'Validation failed.');
    write2log(log, errMsg);
    proj.status = 'failed';
    proj.updated = Date.now();
    proj.save();
    return false;
  }
  // create experimental_design.csv
  await fs.promises.writeFile(`${outdir}/experimental_design.csv`, newCsv);
  // json for template rendering
  const conf = {
    ...projectConf.workflow.input.workflowInput,
    timevalues: projectConf.workflow.input.workflowInput.timeValues.split(/,\s*/).map(str => parseInt(str, 10)),
    treatments: projectConf.workflow.input.workflowInput.treatments.split(/,\s*/),
    fqs: [fq1s, fq2s]
  };
  // generate workflow.init file
  const workflowInitTemplate =
    `cell_line:    <%= cellLine %>
description:  <%= description %>
experiment:   <%= experiment %>
replicate:    <%= replicate %>
resolution:   <%= resolution %>
timeunits:    <%= timeUnits %>
timevalues:   <%- JSON.stringify(timevalues) %>
treatments:   <%- JSON.stringify(treatments) %>`;
  const workflowInit = ejs.render(workflowInitTemplate, conf);
  await fs.promises.writeFile(`${outdir}/workflow.init`, workflowInit);
  // generate workflow.yaml file
  const workflowJsonTemplate =
    `{
  "cell_line": "<%= cellLine %>",
  "datasets": <%- JSON.stringify(fqs) %>,
  "description": "<%= description %>",
  "experiment": "<%= experiment %>",
  "replicate": <%= replicate %>,
  "resolution": <%= resolution %>,
  "timeunits": "<%= timeUnits %>",
  "timevalues": <%- JSON.stringify(timevalues) %>,
  "treatments": <%- JSON.stringify(treatments) %>,
  "version": "1.0.0"
}`;
  const workflowJson = JSON.parse(ejs.render(workflowJsonTemplate, conf));
  // json2yaml
  const workflowYaml = YAML.stringify(workflowJson);
  await fs.promises.writeFile(`${outdir}/workflow.yaml`, workflowYaml);

  return true;
};

// submit workflow - launch slurm run
const submitWorkflow = async (proj, projectConf, inputsize) => {
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`;
  const log = `${projHome}/log.txt`;
  // Run SLURPy
  const workDir = `${projHome}/${workflowList[projectConf.workflow.name].outdir}`;
  // submit workflow
  const runName = `edge-${proj.code}`;
  const cmd = `cd ${workDir}`;
  write2log(log, 'Run pipeline');
  // Don't need to wait for the command to complete. It may take long time to finish and cause an error.
  // The updateJobStatus will catch the error if this command failed.
  execCmd(cmd);
  await sleep(2000); // Wait for 2 seconds
  const newJob = new Job({
    id: runName,
    project: proj.code,
    type: proj.type,
    inputsize,
    queue: 'slurm',
    status: 'Running'
  });
  newJob.save().catch(err => { logger.error('falied to save to slurmjob: ', err); });
  proj.status = 'running';
  proj.updated = Date.now();
  proj.save();
};

const getPid = async (proj) => {
  // To stop the running pipeline depends on the executor.
  // If is local, find pid in .slurm.pid and kill process and all descendant processes: pkill -TERM -P <pid>
  // If is slurm, delete slurm job?
  const pidFile = `${config.IO.PROJECT_BASE_DIR}/${proj.code}/slurm/.slurm.pid`;
  if (fs.existsSync(pidFile)) {
    let all = fs.readFileSync(pidFile, 'utf8');
    all = all.trim();  // final crlf in file
    const lines = all.split('\n');
    if (lines[0]) {
      return parseInt(lines[0], 10);
    }
  }
  return null;
};
// check pid
const pidIsRunning = (pid) => {
  try {
    // a signal of 0 can be used to test for the existence of a process.
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
};

const abortJob = async (proj) => {
  // To stop the running pipeline depends on the executor.
  // If is local, find pid in .slurm.pid and kill process and all descendant processes: pkill -TERM -P <pid>
  // If is slurm, delete slurm job?
  const pid = await getPid(proj);
  if (pid && pidIsRunning(pid)) {
    const cmd = `pkill -TERM -P ${pid}`;
    // Don't need to wait for the deletion, the process may already complete
    execCmd(cmd);
  }
  // delete job
  Job.deleteOne({ project: proj.code }, (err) => {
    if (err) {
      logger.error(`Failed to delete job from DB ${proj.code}:${err}`);
    }
  });
};

const getJobMetadata = async (proj) => {
  logger.info(proj);
  return 'metadata';
};

const generateRunStats = async (project) => {
  const stats = await getJobMetadata(project);
  fs.writeFileSync(`${config.IO.PROJECT_BASE_DIR}/${project.code}/run_stats.json`, JSON.stringify({ 'stats': stats }));
};

const getJobStatus = (statusStr) => {
  // parse output from 'slurm log <run name> -f status
  const statuses = statusStr.split(/\n/);
  let completeCnt = 0;
  let i = 0;
  for (i = 0; i < statuses.length; i += 1) {
    const status = statuses[i].trim();
    if (status === '' || status === 'COMPLETED') {
      // empty line === COMPLETED
      completeCnt += 1;
    }
    if (status === 'ABORTED') {
      return 'Aborted';
    }
  }
  if (completeCnt === statuses.length) {
    return 'Succeeded';
  }
  return 'Failed';
};

const updateJobStatus = async (job, proj) => {
  // get job status
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`;
  // Pipeline status. Possible values are: OK, ERR and empty
  let cmd = `cd ${projHome}`;
  let ret = await execCmd(cmd);

  if (!ret || ret.code !== 0) {
    // command failed
    return;
  }
  // if empty, check pid
  if (ret.message === '') {
    const pid = await getPid(proj);
    if (pid && pidIsRunning(pid)) {
      // workflow is still running, update job updated datetime to move job to the end of job queue
      job.updated = Date.now();
      job.save();
    } else {
      // workflow failed
      job.status = 'Failed';
      job.updated = Date.now();
      job.save();
      // result not as expected
      proj.status = 'failed';
      proj.updated = Date.now();
      proj.save();
      write2log(`${projHome}/log.txt`, 'Nextflow job status: Failed');
    }
    return;
  }

  // Task status. Possible values are: COMPLETED, FAILED, and ABORTED.
  cmd = `cd ${projHome}`;
  ret = await execCmd(cmd);
  if (!ret || ret.code !== 0) {
    // command failed
    return;
  }
  // find job status
  const newStatus = getJobStatus(ret.message);
  // update project status
  if (job.status !== newStatus) {
    let status = null;
    if (newStatus === 'Aborted') {
      status = 'failed';
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
    }
    proj.status = status;
    proj.updated = Date.now();
    proj.save();
    write2log(`${projHome}/log.txt`, `Nextflow job status: ${newStatus}`);
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
