const path = require('path');
const fs = require('fs');
const Upload = require('../edge-api/models/upload');
const config = require('../config');

const cromwellWorkflows = ['sra2fastq'];
const nextflowWorkflows = ['runFaQCs'];

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
  'hic': {
    wdl: '4dgb.wdl',
    wdl_imports: 'imports.zip',
    inputs_tmpl: '4dgb_inputs.tmpl',
    outdir: 'output/hic',
  },
  sra2fastq: {
    wdl: 'sra2fastq.wdl',
    wdl_imports: 'imports.zip',
    inputs_tmpl: 'sra2fastq_inputs.tmpl',
    cromwell_calls: ['sra.sra2fastq'],
    outdir: 'output/sra2fastq',
    // set if not default 1.0
    // wdl_version: '1.0',
  },
  runFaQCs: {
    wdl: 'runQC.wdl',
    wdl_imports: 'imports.zip',
    inputs_tmpl: 'runFaQCs_inputs.tmpl',
    outdir: 'output/runFaQCs',
    nextflow_main: 'runFaQCs_main.nf',
    config_tmpl: 'runFaQCs_config.tmpl',
  },
};

const linkUpload = async (fq, projHome) => {
  try {
    if (fq.startsWith(config.FILE_UPLOADS.FILEUPLOAD_FILE_DIR)) {
      // create input dir and link uploaded file with realname
      const inputDir = `${projHome}/input`;
      if (!fs.existsSync(inputDir)) {
        fs.mkdirSync(inputDir);
      }
      const fileCode = path.basename(fq);
      let name = fileCode;
      const upload = await Upload.findOne({ 'code': name });
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
      return linkFq;
    }
    return fq;
  } catch (err) {
    return Promise.reject(err);
  }
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

module.exports = {
  cromwellWorkflows,
  nextflowWorkflows,
  workflowList,
  linkUpload,
  generateWorkflowResult,
};
