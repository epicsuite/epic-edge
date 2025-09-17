const path = require('path');
const fs = require('fs');
const Upload = require('../edge-api/models/upload');
const config = require('../config');

const cromwellWorkflows = [];
const nextflowWorkflows = ['fdgenome'];
const slurmWorkflows = [];
const nextflowConfigs = {
  executor_config: {
    slurm: 'epic.config',
    local: 'epic.config',
  },
  profile: {
    slurm: 'canfs',
    local: 'standard',
  },
};
const workflowList = {
  'hic': {
    wdl: '4dgb.wdl',
    wdl_imports: 'imports.zip',
    inputs_tmpl: '4dgb_inputs.tmpl',
    outdir: 'output/hic',
  },
  'fq2hic': {
    outdir: 'output/epic',
    nextflow_main: 'main.nf',
    config_tmpl: 'fq2hic_config.tmpl',
  },
  '4dgb': {
    outdir: 'output/4DGB',
    nextflow_main: 'main.nf',
    config_tmpl: 'fq2hic_config.tmpl',
  },
  'fdgenome': {
    outdir: 'output/epic',
    indir: 'input',
    nextflow_main: 'epicedge_main.nf',
    config_tmpl: 'fdgenome_config.tmpl',
    conda_env: '/panfs/biopan04/epicdev/apps/envs/epic',
  },
};

const linkUpload = async (fq, projHome) => {
  try {
    if (fq.startsWith(config.IO.UPLOADED_FILES_DIR)) {
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
  slurmWorkflows,
  nextflowConfigs,
  workflowList,
  linkUpload,
  generateWorkflowResult,
};
