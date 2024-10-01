/* eslint-disable guard-for-in */
const fs = require('fs');
const moment = require('moment');
const FormData = require('form-data');
const ejs = require('ejs');
const YAML = require('json-to-pretty-yaml');
const Job = require('../edge-api/models/job');
const common = require('./common');
const logger = require('./logger');
const config = require('../config');

const workflows = ['4dgb', 'sra2fastq', 'runFaQCs'];

const workflowList = {
  default_wdl_version: '1.0',
  '4dgb': {
    wdl: '4dgb.wdl',
    wdl_imports: 'imports.zip',
    inputs_tmpl: '4dgb_inputs.tmpl',
    outdir: 'output/4DGB',
    // set if not default 1.0
    // wdl_version: '1.0',
  },
  sra2fastq: {
    wdl: 'sra2fastq.wdl',
    wdl_imports: 'imports.zip',
    inputs_tmpl: 'sra2fastq_inputs.tmpl',
    outdir: 'output/sra2fastq',
    // set if not default 1.0
    // wdl_version: '1.0',
  },
  runFaQCs: {
    wdl: 'runQC.wdl',
    wdl_imports: 'imports.zip',
    inputs_tmpl: 'runFaQCs_inputs.tmpl',
    outdir: 'output/runFaQCs',
  },
};

const generateWDL = async (projHome, projectConf) => {
  // projectConf: project conf.js
  // workflowList in utils/conf
  const wdl = `${config.CROMWELL.WDL_DIR}/${projectConf.category}/${workflowList[projectConf.workflow.name].wdl}`;
  if (fs.existsSync(wdl)) {
    // add pipeline.wdl link
    fs.symlinkSync(wdl, `${projHome}/pipeline.wdl`, 'file');
    return true;
  }
  return false;
};

const generateInputs = async (projHome, projectConf, workflowConf, proj) => {
  // projectConf: project conf.js
  // workflowList in utils/conf
  // workflowConf: data/workflow/conf.json
  const workflowSettings = workflowList[projectConf.workflow.name];
  const template = String(fs.readFileSync(`${config.CROMWELL.TEMPLATE_DIR}/${projectConf.category}/${workflowSettings.inputs_tmpl}`));
  const params = { ...workflowConf, ...projectConf.workflow.input, outdir: `${projHome}/${workflowSettings.outdir}` };

  if (projectConf.workflow.name === '4dgb') {
    // set up FDGB workflow input directory
    const inputDir = `${projHome}/input`;
    if (!fs.existsSync(inputDir)) {
      fs.mkdirSync(inputDir);
    }
    // setup datasets
    const workflow = projectConf.workflow.input;
    let src = workflow.datasets[0].data;
    let dest = `${inputDir}/dataset1.hic`;
    fs.copyFileSync(src, dest);
    src = workflow.datasets[1].data;
    dest = `${inputDir}/dataset2.hic`;
    fs.copyFileSync(src, dest);
    // generate FDGB workflow project.yaml
    const fdgbSettings = { id: proj.code, name: proj.name, ...workflow.projectSettings };
    if (fdgbSettings.blackout.length === 0) {
      delete fdgbSettings.blackout;
    }

    const fdgbDatasets = [{ name: workflow.datasets[0].name, data: 'dataset1.hic' }, { name: workflow.datasets[1].name, data: 'dataset2.hic' }];

    const fdgbProj = { project: fdgbSettings, datasets: fdgbDatasets };
    if (workflow.tracks) {
      // eslint-disable-next-line no-restricted-syntax
      for (const i in workflow.tracks) {
        src = workflow.tracks[i].file;
        dest = `${inputDir}/track${i}.csv`;
        fs.copyFileSync(src, dest);
        workflow.tracks[i].file = `track${i}.csv`;
        if (workflow.tracks[i].columns[0].file) {
          src = workflow.tracks[i].columns[0].file;
          dest = `${inputDir}/track${i}_column_1.csv`;
          fs.copyFileSync(src, dest);
          workflow.tracks[i].columns[0].file = `track${i}_column_1.csv`;
        } else {
          delete workflow.tracks[i].columns[0].file;
        }
        if (workflow.tracks[i].columns[1].file) {
          src = workflow.tracks[i].columns[1].file;
          dest = `${inputDir}/track${i}_column_2.csv`;
          fs.copyFileSync(src, dest);
          workflow.tracks[i].columns[1].file = `track${i}_column_2.csv`;
        } else {
          delete workflow.tracks[i].columns[1].file;
        }
      }
      fdgbProj.tracks = workflow.tracks;
    }
    if (workflow.annotations) {
      if (workflow.annotations.genes && workflow.annotations.genes.file) {
        if (!fdgbProj.annotations) {
          fdgbProj.annotations = {};
        }
        fdgbProj.annotations.genes = {};
        src = workflow.annotations.genes.file;
        dest = `${inputDir}/annotations_genes.gff`;
        fs.copyFileSync(src, dest);
        fdgbProj.annotations.genes.file = 'annotations_genes.gff';
        if (workflow.annotations.genes.description) {
          fdgbProj.annotations.genes.description = workflow.annotations.genes.description;
        }
      }
      if (workflow.annotations.features && workflow.annotations.features.file) {
        if (!fdgbProj.annotations) {
          fdgbProj.annotations = {};
        }
        fdgbProj.annotations.features = {};
        src = workflow.annotations.features.file;
        dest = `${inputDir}/annotations_features.csv`;
        fs.copyFileSync(src, dest);
        fdgbProj.annotations.features.file = 'annotations_features.csv';
        if (workflow.annotations.features.description) {
          fdgbProj.annotations.features.description = workflow.annotations.features.description;
        }
      }
    }
    if (workflow.bookmarks) {
      if (workflow.bookmarks.locations && workflow.bookmarks.locations.length > 0) {
        if (!fdgbProj.bookmarks) {
          fdgbProj.bookmarks = {};
        }
        fdgbProj.bookmarks.locations = workflow.bookmarks.locations;
      }
      if (workflow.bookmarks.features && workflow.bookmarks.features.length > 0) {
        if (!fdgbProj.bookmarks) {
          fdgbProj.bookmarks = {};
        }
        fdgbProj.bookmarks.features = workflow.bookmarks.features;
      }
    }
    const YAMLfile = YAML.stringify(fdgbProj);
    fs.writeFileSync(`${inputDir}/workflow.yaml`, YAMLfile);
    // inputs template var
    params.projdir = inputDir;
  }

  // render input template and write to pipeline_inputs.json
  const inputs = ejs.render(template, params);
  await fs.promises.writeFile(`${projHome}/pipeline_inputs.json`, inputs);
  // render options template and write to pipeline_options.json
  if (fs.existsSync(`${config.CROMWELL.TEMPLATE_DIR}/${projectConf.category}/${workflowSettings.options_tmpl}`)) {
    const optionsTemplate = String(fs.readFileSync(`${config.CROMWELL.TEMPLATE_DIR}/${projectConf.category}/${workflowSettings.options_tmpl}`));
    const options = ejs.render(optionsTemplate, params);
    await fs.promises.writeFile(`${projHome}/pipeline_options.json`, options);
  }
  return true;
};

// submit workflow to cromwell through api
const submitWorkflow = (proj, projectConf, inputsize) => {
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`;
  const formData = new FormData();
  formData.append('workflowSource', fs.createReadStream(`${projHome}/pipeline.wdl`));
  // logger.debug(`workflowSource: ${projHome}/pipeline.wdl`);
  formData.append('workflowInputs', fs.createReadStream(`${projHome}/pipeline_inputs.json`));
  // logger.debug(`workflowInputs${projHome}/pipeline_inputs.json`);

  const imports = `${config.CROMWELL.WDL_DIR}/${projectConf.category}/${workflowList[projectConf.workflow.name].wdl_imports}`;
  const optionsJson = `${projHome}/pipeline_options.json`;

  if (fs.existsSync(optionsJson)) {
    formData.append('workflowOptions', fs.createReadStream(optionsJson));
    logger.debug(`workflowOptions:${optionsJson}`);
  }

  formData.append('workflowType', config.CROMWELL.WORKFLOW_TYPE);
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

  common.postData(config.CROMWELL.API_BASE_URL, formData, {
    headers: {
      ...formHeaders, formBoundary
    },
  }).then(response => {
    logger.debug(JSON.stringify(response));
    const newJob = new Job({
      id: response.id,
      project: proj.code,
      type: proj.type,
      inputsize,
      status: 'Submitted'
    });
    newJob.save().catch(err => { logger.error('falied to save to cromwelljobs: ', err); });
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
    common.write2log(`${config.IO.PROJECT_BASE_DIR}/${proj.code}/log.txt`, message);
    logger.error(`Failed to submit workflow to Cromwell: ${message}`);
  });
};

const abortJob = (job) => {
  // abort job through api
  logger.debug(`POST: ${config.CROMWELL.API_BASE_URL}/${job.id}/abort`);
  common.postData(`${config.CROMWELL.API_BASE_URL}/${job.id}/abort`).then(response => {
    logger.debug(response);
    // update job status
    job.status = 'Aborted';
    job.updated = Date.now();
    job.save();
    common.write2log(`${config.IO.PROJECT_BASE_DIR}/${job.project}/log.txt`, 'Cromwell job aborted.');
  }).catch(error => {
    let message = error;
    if (error.message) {
      message = error.message;
    }
    common.write2log(`${config.IO.PROJECT_BASE_DIR}/${job.project}/log.txt`, message);
    logger.error(message);
    // not cromwell api server error, job may already complete/fail
    if (error.status !== 500) {
      job.status = 'Aborted';
      job.updated = Date.now();
      job.save();
      common.write2log(`${config.IO.PROJECT_BASE_DIR}/${job.project}/log.txt`, 'Cromwell job aborted.');
    }
  });
};

const getJobMetadata = (job) => {
  // get job metadata through api
  logger.debug(`GET: ${config.CROMWELL.API_BASE_URL}/${job.id}/metadata`);
  common.getData(`${config.CROMWELL.API_BASE_URL}/${job.id}/metadata`).then(metadata => {
    // logger.debug(JSON.stringify(metadata));
    logger.debug(`${config.IO.PROJECT_BASE_DIR}/${job.project}/cromwell_job_metadata.json`);
    fs.writeFileSync(`${config.IO.PROJECT_BASE_DIR}/${job.project}/cromwell_job_metadata.json`, JSON.stringify(metadata));

    // dump error logs
    Object.keys(metadata.calls).forEach((callkey) => {
      const subStatus = metadata.calls[callkey][0].executionStatus;
      const subId = metadata.calls[callkey][0].subWorkflowId;

      // get cromwell logs
      if (subStatus === 'Failed' && subId) {
        logger.debug(`GET: ${config.CROMWELL.API_BASE_URL}/${subId}/logs`);
        common.getData(`${config.CROMWELL.API_BASE_URL}/${subId}/logs`).then(logs => {
          logger.debug(JSON.stringify(logs));
          fs.writeFileSync(`${config.IO.PROJECT_BASE_DIR}/${job.project}/${callkey}.cromwell_job_logs.json`, JSON.stringify(logs));
          // dump stderr to log.txt
          Object.keys(logs.calls).forEach((call) => {
            logger.debug(call);
            logs.calls[call].forEach(item => {
              const { stderr } = item;
              logger.debug(stderr);
              if (fs.existsSync(stderr)) {
                const errs = fs.readFileSync(stderr);
                common.write2log(`${config.IO.PROJECT_BASE_DIR}/${job.project}/log.txt`, call);
                common.write2log(`${config.IO.PROJECT_BASE_DIR}/${job.project}/log.txt`, errs);
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
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`;
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
  const confFile = `${config.IO.PROJECT_BASE_DIR}/${project.code}/conf.json`;
  const jobMetadataFile = `${config.IO.PROJECT_BASE_DIR}/${project.code}/cromwell_job_metadata.json`;

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

  fs.writeFileSync(`${config.IO.PROJECT_BASE_DIR}/${project.code}/run_stats.json`, JSON.stringify({ 'stats': stats }));
};

const updateJobStatus = (job, proj) => {
  // get job status through api
  logger.debug(`GET: ${config.CROMWELL.API_BASE_URL}/${job.id}/status`);
  common.getData(`${config.CROMWELL.API_BASE_URL}/${job.id}/status`).then(response => {
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
      common.write2log(`${config.IO.PROJECT_BASE_DIR}/${job.project}/log.txt`, `Cromwell job status: ${response.status}`);
    }
    // update job even its status unchanged. We need set new updated time for this job.
    if (response.status === 'Aborted') {
      // delete job
      Job.deleteOne({ project: proj.code }, (err) => {
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
    common.write2log(`${config.IO.PROJECT_BASE_DIR}/${job.project}/log.txt`, message);
    logger.error(message);
  });
};

module.exports = {
  workflows,
  workflowList,
  generateWDL,
  generateInputs,
  submitWorkflow,
  generateWorkflowResult,
  generateRunStats,
  abortJob,
  getJobMetadata,
  updateJobStatus,
};
