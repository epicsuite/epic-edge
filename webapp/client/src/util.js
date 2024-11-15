export const workflowList = {
  sra2fastq: {
    label: 'Download SRA Data',
    category: 'data',
    // img: '/docs/images/sra2fastq.png',
    // thumbnail: '/docs/images/sra2fastq-thumbnail.png',
    link: 'https://github.com/LANL-Bioinformatics/EDGE_workflows/tree/main/sra2fastq',
    // doclink: 'https://nmdc-workflow-documentation.readthedocs.io/en/latest/chapters/6_MetaT_index.html',
    info: 'Sra2fastq workflow retrieves sequence project in FASTQ files from  NCBI- SRA / EBI - ENA / DDBJ database. Input accession number supports studies(SRP*/ ERP * /DRP*), experiments (SRX*/ERX * /DRX*), samples(SRS * /ERS*/DRS *), runs(SRR * /ERR*/DRR *), or submissions (SRA * /ERA*/DRA *).',
  },
  runFaQCs: {
    label: 'Reads QC',
    category: 'metagenomics',
    img: '/docs/images/runFaQCs.png',
    thumbnail: '/docs/images/runFaQCs-thumbnail.png',
    video: '/docs/videos/runFaQCs.mp4',
    pdf: '/docs/help/runFaQCs.pdf',
    link: 'https://github.com/microbiomedata/runFaQCs',
    doclink:
      'https://nmdc-workflow-documentation.readthedocs.io/en/latest/chapters/1_RQC_index.html',
    info: 'This workflow is a replicate of the QA protocol implemented at JGI for Illumina reads and use the program “rqcfilter2” from BBTools(38:44) which implements them as a pipeline.',
  },
  '4dgb': {
    label: '4DGB',
    category: 'epic',
    title: '4DGB Workflow',
    name: '4DGB Workflow',
    inputLink: 'https://github.com/4DGB/4DGBWorkflow/blob/main/doc/project.md',
    link: 'https://github.com/4DGB/4DGBWorkflow',
    info: 'A dockerized application implementing an end-to-end workflow to process Hi-C data files and displaying their structures in an instance of the 4D Genome Browser.',
  },
  hic: {
    label: 'Slurpy Hi-C',
    category: 'epic slurpy',
    title: 'Slurpy Hi-C processing',
    name: 'Slurpy Hi-C processiong',
  },
  peaksATAC: {
    label: 'Slurpy ATAC-seq protocol',
    category: 'epic slurpy',
    title: 'Slurpy ATAC-seq protocol',
    name: 'Slurpy ATAC-seq protocol',
  },
  peaksCHIP: {
    label: 'Slurpy CHIP-seq protocol',
    category: 'epic slurpy',
    title: 'Slurpy CHIP-seq protocol',
    name: 'Slurpy CHIP-seq protocol',
  },
}