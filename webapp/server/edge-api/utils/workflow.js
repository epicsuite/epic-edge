const fs = require('fs');
const ufs = require('url-file-size');
const path = require('path');
const moment = require('moment');
const FormData = require('form-data');
const ejs = require('ejs');
const CromwellJob = require('../models/job');
const Upload = require('../models/upload');
const { workflowList } = require('./conf');
const common = require('../../utils/common');
const logger = require('../../utils/logger');

const linkUpload = (fq, projHome) => new Promise((resolve) => {
  if (fq.startsWith(process.env.FILEUPLOAD_FILE_DIR)) {
    // create input dir and link uploaded file with realname
    const inputDir = `${projHome}/input`;
    if (!fs.existsSync(inputDir)) {
      fs.mkdirSync(inputDir);
    }
    const fileCode = path.basename(fq);
    let name = fileCode;
    Upload.findOne({ 'code': name }).then(upload => {
      if (upload) {
        name = upload.name;
      }
      let linkFq = `${inputDir}/${name}`;
      let i = 1;
      while (fs.existsSync(linkFq)) {
        i += 1;
        if (name.includes('.')) {
          const newName = name.replace('.', `${i}.`);
          linkFq = `${inputDir}/${newName}`;
        } else {
          linkFq = `${inputDir}/${name}${i}`;
        }
      }
      fs.symlinkSync(fq, linkFq, 'file');
      resolve(linkFq);
    });
  } else {
    resolve(fq);
  }
});

const generateWDL = async (projHome, projectConf) => {
  // projectConf: project conf.js
  // workflowList in utils/conf
  const wdl = `${process.env.WORKFLOW_WDL_HOME}/${projectConf.category}/${workflowList[projectConf.workflow.name].wdl}`;
  if (fs.existsSync(wdl)) {
    // add pipeline.wdl link
    fs.symlinkSync(wdl, `${projHome}/pipeline.wdl`, 'file');
    return true;
  }
  return false;
};

const generateInputs = async (projHome, projectConf, workflowConf) => {
  // projectConf: project conf.js
  // workflowList in utils/conf
  // workflowConf: data/workflow/conf.json
  const workflowSettings = workflowList[projectConf.workflow.name];
  const template = String(fs.readFileSync(`${process.env.WORKFLOW_TEMPLATE_HOME}/${projectConf.category}/${workflowSettings.inputs_tmpl}`));
  const params = { ...workflowConf, ...projectConf.workflow.input, outdir: `${projHome}/${workflowSettings.outdir}` };

  if (projectConf.workflow.name === 'sra2fastq') {
    params.outdir = process.env.SRA_DATA_HOME;
  }

  if (projectConf.workflow.name === 'runFaQCs') {
    // runFaQCs needs fastq file name as output prefix
    // add links for uploaded files
    // check upload file
    params.inputFastq = [];
    // check upload file
    for (let ind = 0; ind < projectConf.workflow.input.inputFastq.length; ind += 1) {
      const fq = projectConf.workflow.input.inputFastq[ind];
      // eslint-disable-next-line no-await-in-loop
      params.inputFastq.push(await linkUpload(fq, projHome));
    };
  }

  // render input template and write to pipeline_inputs.json
  const inputs = ejs.render(template, params);
  await fs.promises.writeFile(`${projHome}/pipeline_inputs.json`, inputs);
  // render options template and write to pipeline_options.json
  if (fs.existsSync(`${process.env.WORKFLOW_TEMPLATE_HOME}/${projectConf.category}/${workflowSettings.options_tmpl}`)) {
    const optionsTemplate = String(fs.readFileSync(`${process.env.WORKFLOW_TEMPLATE_HOME}/${projectConf.category}/${workflowSettings.options_tmpl}`));
    const options = ejs.render(optionsTemplate, params);
    await fs.promises.writeFile(`${projHome}/pipeline_options.json`, options);
  }
  return true;
};

// submit workflow to cromwell through api
const submitWorkflow = (proj, projectConf, inputsize) => {
  const projHome = `${process.env.PROJECT_HOME}/${proj.code}`;
  const formData = new FormData();
  formData.append('workflowSource', fs.createReadStream(`${projHome}/pipeline.wdl`));
  // logger.debug(`workflowSource: ${projHome}/pipeline.wdl`);
  formData.append('workflowInputs', fs.createReadStream(`${projHome}/pipeline_inputs.json`));
  // logger.debug(`workflowInputs${projHome}/pipeline_inputs.json`);

  const imports = `${process.env.WORKFLOW_WDL_HOME}/${projectConf.category}/${workflowList[projectConf.workflow.name].wdl_imports}`;
  const optionsJson = `${projHome}/pipeline_options.json`;

  if (fs.existsSync(optionsJson)) {
    formData.append('workflowOptions', fs.createReadStream(optionsJson));
    logger.debug(`workflowOptions:${optionsJson}`);
  }

  formData.append('workflowType', process.env.CROMWELL_WORKFLOW_TYPE);
  let wdlVersion = workflowList[projectConf.workflow.name].wdl_version;
  if (!wdlVersion) {
    wdlVersion = workflowList.default_wdl_version;
    logger.debug(`wdlVersion:${wdlVersion}`);
  }
  formData.append('workflowTypeVersion', wdlVersion);
  formData.append('workflowDependencies', fs.createReadStream(imports), { contentType: 'application/zip' });
  logger.debug(`workflowDependencies: ${imports}`);

  const formHeaders = formData.getHeaders();
  const formBoundary = formData.getBoundary();

  common.postData(process.env.CROMWELL_API_URL, formData, {
    headers: {
      ...formHeaders, formBoundary
    },
  }).then(response => {
    logger.debug(JSON.stringify(response));
    const newCromwellJob = new CromwellJob({
      id: response.id,
      project: proj.code,
      type: proj.type,
      inputsize,
      status: 'Submitted'
    });
    newCromwellJob.save().catch(err => { logger.error('falied to save to cromwelljobs: ', err); });
    proj.status = 'submitted';
    proj.updated = Date.now();
    proj.save();
  }).catch(error => {
    proj.status = 'failed';
    proj.updated = Date.now();
    proj.save();
    let message = error;
    if (error.data) {
      message = error.data.message;
    }
    common.write2log(`${process.env.PROJECT_HOME}/${proj.code}/log.txt`, message);
    logger.error(`Failed to submit workflow to Cromwell: ${message}`);
  });
};

const abortJob = (job) => {
  // abort job through api
  logger.debug(`POST: ${process.env.CROMWELL_API_URL}/${job.id}/abort`);
  common.postData(`${process.env.CROMWELL_API_URL}/${job.id}/abort`).then(response => {
    logger.debug(response);
    // update job status
    job.status = 'Aborted';
    job.updated = Date.now();
    job.save();
    common.write2log(`${process.env.PROJECT_HOME}/${job.project}/log.txt`, 'Cromwell job aborted.');
  }).catch(error => {
    let message = error;
    if (error.message) {
      message = error.message;
    }
    common.write2log(`${process.env.PROJECT_HOME}/${job.project}/log.txt`, message);
    logger.error(message);
    // not cromwell api server error, job may already complete/fail
    if (error.status !== 500) {
      job.status = 'Aborted';
      job.updated = Date.now();
      job.save();
      common.write2log(`${process.env.PROJECT_HOME}/${job.project}/log.txt`, 'Cromwell job aborted.');
    }
  });
};

const getJobMetadata = (job) => {
  // get job metadata through api
  logger.debug(`GET: ${process.env.CROMWELL_API_URL}/${job.id}/metadata`);
  common.getData(`${process.env.CROMWELL_API_URL}/${job.id}/metadata`).then(metadata => {
    // logger.debug(JSON.stringify(metadata));
    logger.debug(`${process.env.PROJECT_HOME}/${job.project}/cromwell_job_metadata.json`);
    fs.writeFileSync(`${process.env.PROJECT_HOME}/${job.project}/cromwell_job_metadata.json`, JSON.stringify(metadata));

    // dump error logs
    Object.keys(metadata.calls).forEach((callkey) => {
      const subStatus = metadata.calls[callkey][0].executionStatus;
      const subId = metadata.calls[callkey][0].subWorkflowId;

      // get cromwell logs
      if (subStatus === 'Failed' && subId) {
        logger.debug(`GET: ${process.env.CROMWELL_API_URL}/${subId}/logs`);
        common.getData(`${process.env.CROMWELL_API_URL}/${subId}/logs`).then(logs => {
          logger.debug(JSON.stringify(logs));
          fs.writeFileSync(`${process.env.PROJECT_HOME}/${job.project}/${callkey}.cromwell_job_logs.json`, JSON.stringify(logs));
          // dump stderr to log.txt
          Object.keys(logs.calls).forEach((call) => {
            logger.debug(call);
            logs.calls[call].forEach(item => {
              const { stderr } = item;
              logger.debug(stderr);
              if (fs.existsSync(stderr)) {
                const errs = fs.readFileSync(stderr);
                common.write2log(`${process.env.PROJECT_HOME}/${job.project}/log.txt`, call);
                common.write2log(`${process.env.PROJECT_HOME}/${job.project}/log.txt`, errs);
              }
            });
          });
        }).catch(error => {
          logger.error(`Failed to get logs from Cromwell API: ${error}`);
        });
      }
    });

  }).catch(error => {
    logger.error(`Failed to get metadata from Cromwell API: ${error}`);
  });
};

const generateWorkflowResult = (proj) => {
  const projHome = `${process.env.PROJECT_HOME}/${proj.code}`;
  const resultJson = `${projHome}/result.json`;

  if (!fs.existsSync(resultJson)) {
    const result = {};
    const projectConf = JSON.parse(fs.readFileSync(`${projHome}/conf.json`));
    const outdir = `${projHome}/${workflowList[projectConf.workflow.name].outdir}`;

    if (projectConf.workflow.name === 'sra2fastq') {
      // use relative path
      const { accessions } = projectConf.workflow.input;
      accessions.forEach((accession) => {
        // link sra downloads to project output
        fs.symlinkSync(`../../../../sra/${accession}`, `${outdir}/${accession}`);

      });
    }

    fs.writeFileSync(resultJson, JSON.stringify(result));
  }
};

const getWorkflowStats = (jobStats, cromwellCalls, workflow, workflowStats, stats) => {
  workflowStats.Status = '';
  workflowStats['Running Time'] = '';
  workflowStats.Start = '';
  workflowStats.End = '';
  let myStart = '';
  let myEnd = '';
  cromwellCalls.forEach(cromwellCall => {
    if (jobStats.calls[cromwellCall]) {
      if (!workflowStats.Status || workflowStats.Status !== 'Failed') {
        // set status to 'Failed' is one of the subjob is failed
        workflowStats.Status = jobStats.calls[cromwellCall][0].executionStatus;
      }
      const { start } = jobStats.calls[cromwellCall][0];
      const { end } = jobStats.calls[cromwellCall][0];

      if (start && !workflowStats.Start) {
        workflowStats.Start = moment(start).format('YYYY-MM-DD HH:mm:ss');
        myStart = start;
      }
      if (end) {
        workflowStats.End = moment(end).format('YYYY-MM-DD HH:mm:ss');
        myEnd = end;
      }
    }
  });

  if (myStart && myEnd) {
    const ms = moment(myEnd, 'YYYY-MM-DD HH:mm:ss').diff(moment(myStart, 'YYYY-MM-DD HH:mm:ss'));
    const d = moment.duration(ms);
    workflowStats['Running Time'] = common.timeFormat(d);
  }
  stats.push(workflowStats);
};

const generateRunStats = (project) => {
  const confFile = `${process.env.PROJECT_HOME}/${project.code}/conf.json`;
  const jobMetadataFile = `${process.env.PROJECT_HOME}/${project.code}/cromwell_job_metadata.json`;

  let rawdata = fs.readFileSync(confFile);
  const conf = JSON.parse(rawdata);

  const stats = [];
  if (fs.existsSync(jobMetadataFile)) {
    rawdata = fs.readFileSync(jobMetadataFile);
    const jobStats = JSON.parse(rawdata);
    if (conf.workflow) {
      const workflowStats = {};
      const cromwellCalls = workflowList[conf.workflow.name].cromwell_calls;
      workflowStats.Workflow = workflowList[conf.workflow.name].full_name;
      workflowStats.Run = 'On';
      getWorkflowStats(jobStats, cromwellCalls, conf.workflow, workflowStats, stats);
    }
  }

  fs.writeFileSync(`${process.env.PROJECT_HOME}/${project.code}/run_stats.json`, JSON.stringify({ 'stats': stats }));
};

const updateJobStatus = (job, proj) => {
  // get job status through api
  logger.debug(`GET: ${process.env.CROMWELL_API_URL}/${job.id}/status`);
  common.getData(`${process.env.CROMWELL_API_URL}/${job.id}/status`).then(response => {
    logger.debug(JSON.stringify(response));
    // update project status
    if (job.status !== response.status) {
      let status = null;
      if (response.status === 'Running') {
        status = 'running';
      } else if (response.status === 'Succeeded') {
        // generate result.json
        logger.info('generate workflow result.json');
        try {
          generateWorkflowResult(proj);
        } catch (e) {
          job.status = response.status;
          job.updated = Date.now();
          job.save();
          // result not as expected
          proj.status = 'failed';
          proj.updated = Date.now();
          proj.save();
          throw e;
        }
        status = 'complete';
      } else if (response.status === 'Failed') {
        status = 'failed';
      } else if (response.status === 'Aborted') {
        status = 'in queue';
      }
      proj.status = status;
      proj.updated = Date.now();
      proj.save();
      common.write2log(`${process.env.PROJECT_HOME}/${job.project}/log.txt`, `Cromwell job status: ${response.status}`);
    }
    // update job even its status unchanged. We need set new updated time for this job.
    if (response.status === 'Aborted') {
      // delete job
      CromwellJob.deleteOne({ project: proj.code }, (err) => {
        if (err) {
          logger.error(`Failed to delete job from DB ${proj.code}:${err}`);
        }
      });
    } else {
      job.status = response.status;
      job.updated = Date.now();
      job.save();
      getJobMetadata(job);
    }
  }).catch(error => {
    let message = error;
    if (error.message) {
      message = error.message;
    }
    common.write2log(`${process.env.PROJECT_HOME}/${job.project}/log.txt`, message);
    logger.error(message);
  });
};

async function fileStats(file) {
  let stats = {};
  if (file.toLowerCase().startsWith('http')) {
    stats = await ufs(file)
      .then(size => ({ size }))
      .catch(() => ({ size: 0 }));
  } else {
    stats = fs.statSync(file);
  }
  return stats;
}

async function findInputsize(projectConf) {
  if (!projectConf.files) {
    return 0;
  }
  let size = 0;
  await Promise.all(projectConf.files.map(async (file) => {
    if (file !== '') {
      // not optional file without input
      const stats = await fileStats(file);
      size += stats.size;
    }
  }));
  // console.log('file size', size);
  return size;
}

module.exports = {
  generateWDL,
  generateInputs,
  submitWorkflow,
  generateWorkflowResult,
  generateRunStats,
  abortJob,
  getJobMetadata,
  updateJobStatus,
  findInputsize
};
