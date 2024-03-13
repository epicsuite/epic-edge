// note: the first status/type will be the default in the DB.
const projectStatus = ['in queue', 'running', 'failed', 'delete', 'rerun', 'interrupted', 'complete', 'processing', 'submitted'];
const uploadStatus = ['live', 'delete'];
const jobStatus = ['Submitted', 'Running', 'Failed', 'Aborted', 'Succeeded'];
const queueTypes = ['cromwell', 'nextflow'];

const workflowList = {
  default_wdl_version: '1.0',
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

module.exports = {
  projectStatus,
  uploadStatus,
  jobStatus,
  queueTypes,
  workflowList,
};
