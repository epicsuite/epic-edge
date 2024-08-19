import { workflowList } from 'src/edge/common/util'

export const slurpy = {
  label: 'Slurpy',
  category: 'epic slurpy',
  title: 'Slurpy',
  name: 'Slurpy',
  inputLink:
    'https://github.com/lanl/SLUR-M-py?tab=readme-ov-file#envoking-slurpy-for-hi-c-processing',
  link: 'https://github.com/lanl/SLUR-M-py',
  info: 'SLUR(M)-py: A SLURM Powered Pythonic Pipeline for Parallel Processing of 3D (Epi)genomic Profiles',
}

export const workflowOptions = [
  { value: 'hic', label: workflowList['hic'].label },
  { value: 'peaksATAC', label: workflowList['peaksATAC'].label },
  { value: 'peaksCHIP', label: workflowList['peaksCHIP'].label },
]

export const components = {
  hic: {
    text: 'Input',
    info: 'Envoking slurpy for Hi-C processing',
    link: 'https://github.com/lanl/SLUR-M-py?tab=readme-ov-file#envoking-slurpy-for-hi-c-processing',
    validForm: false,
    errMessage: 'Input error.<br/>',
    inputs: {
      pairedFile: {
        text: 'Is interleaved',
        value: true,
      },
      inputFastq: {
        text: 'Input Raw Reads',
        value: [],
        display: [],
        fastqInput: {
          tooltip:
            'Hi-C requires paired-end Illumina data in FASTQ format as the input; the file can be interleaved and can becompressed. <br/>Acceptable file formats: .fastq, .fq, .fastq.gz, .fq.gz',
          enableInput: false,
          placeholder: 'Select a file',
          dataSources: ['upload', 'public'],
          fileTypes: ['fastq', 'fq', 'fastq.gz', 'fq.gz'],
          viewFile: false,
          isOptional: false,
          cleanupInput: false,
          maxInput: 100,
        },
      },
      referenceBwaIndex: {
        text: 'Reference BWA Index',
        value: null,
        display: null,
        fileInput: {
          tooltip: 'Path to input reference bwa index used in analysis.',
          enableInput: false,
          placeholder: 'Select a file',
          dataSources: ['upload', 'public'],
          fileTypes: ['bwaix'],
          viewFile: false,
          isOptional: false,
          cleanupInput: false,
        },
      },
      mtDNA: {
        text: 'Name of Mitochondrial Contig',
        value: 'chrM',
        textInput: {
          placeholder: '(required)',
          tooltip: 'Name of the mitochondrial contig (default: chrM).',
          showError: false,
          isOptional: false,
          showErrorTooltip: true,
          errMessage: 'Required.',
          defaultValue: 'chrM',
        },
      },
      mapThreshold: {
        text: 'Map Threshold',
        value: 30,
        rangeInput: {
          tooltip: 'Mapping quality threshold to filter alignments (default: 30).',
          defaultValue: 30,
          min: 0,
          max: 40,
          step: 1,
        },
      },
      errorDistance: {
        text: 'Error Distance',
        value: 10000,
        integerInput: {
          tooltip:
            'Linear genomic distance to parse left and right oriented, intra-chromosomal Hi-C pairs for missing restriciton site(s). Passing zero (0) will skip this check (default: 10000 bp).',
          min: 0,
          max: 100000000000,
          defaultValue: 10000,
        },
      },
      selfCircle: {
        text: 'Self Circle',
        value: 30000,
        integerInput: {
          tooltip:
            'Linear genomic distance to check outward facing, intra-chromosomal Hi-C contacts for self-circle artifacts. Passing zero (0) will skip this check (default: 30000 bp).',
          min: 0,
          max: 100000000000,
          defaultValue: 30000,
        },
      },
      library: {
        text: 'Library',
        value: 'Arima',
        selectInput: {
          tooltip:
            'The name of the restriction site enzyme (or library prep) used in Hi-C sample creation. Options include Arima, MboI, DpnII, Sau3AI, and HindIII (default: Arima). Passing none (i.e. Dovetail) is also allowed, but checks for restriction sites and dangling ends will be skipped.',
          options: [
            { value: 'Arima', label: 'Arima' },
            { value: 'MboI', label: 'MboI' },
            { value: 'DpnII', label: 'DpnII' },
            { value: 'Sau3AI', label: 'Sau3AI' },
            { value: 'HindIII', label: 'HindIII' },
            { value: 'None', label: 'None' },
          ],
          setDefault: true,
          isOptional: false,
          placeholder: '',
          isClearable: false,
        },
      },
      mindist: {
        text: 'Minimum Distance',
        value: 0,
        integerInput: {
          tooltip:
            'A filter on the minimum allowed distance (in bp) between reads (within a pair) that make up an intra-chromosomal Hi-C contact. Default behaviour is none (i.e. default: 0).',
          min: 0,
          max: 100000000000,
          defaultValue: 0,
        },
      },
      genomelist: {
        text: 'List of Chromosomes',
        value: null,
        display: null,
        fileInput: {
          tooltip:
            'Path to list of chromosomes (by name) to include in final Hi-C analysis. Must be a tab seperated tsv or bed, comma seperated csv, or space seperated txt file with no header.',
          enableInput: false,
          placeholder: '(Optional) Select a file',
          dataSources: ['upload', 'public'],
          fileTypes: ['tsv', 'csv', 'txt'],
          viewFile: false,
          isOptional: true,
          cleanupInput: true,
        },
      },
    },
    // only for input with validation method
    validInputs: {
      inputFastq: { isValid: false, error: 'Input Fastq error.' },
      referenceBwaIndex: { isValid: false, error: 'Reference BWA Index error.' },
      mtDNA: { isValid: true, error: 'Name of Mitochondrial Contig error.' },
      errorDistance: { isValid: true, error: 'Error Distance error.' },
      selfCircle: { isValid: true, error: 'Self Circle error.' },
      mindist: { isValid: true, error: 'Minimum Distance error.' },
    },
  },
  peaksATAC: {
    text: 'Input',
    info: 'To call the peaks.py script within the slurpy pipeline to analyze an ATAC-seq experiment run',
    link: 'https://github.com/lanl/SLUR-M-py?tab=readme-ov-file#for-atac-seq-experiments',
    validForm: false,
    errMessage: 'Input error.<br/>',
    inputs: {
      referenceFile: {
        text: 'Reference fasta',
        value: null,
        display: null,
        fileInput: {
          tooltip: 'Reference file in fasta format',
          enableInput: false,
          placeholder: 'Select a file',
          dataSources: ['upload', 'public', 'project'],
          fileTypes: ['fasta', 'fa', 'fna', 'contigs'],
          projectTypes: ['hic'],
          viewFile: false,
          isOptional: false,
          cleanupInput: false,
        },
      },
    },
    // only for input with validation method
    validInputs: {
      referenceFile: { isValid: false, error: 'Reference fasta error.' },
    },
  },
  peaksCHIP: {
    text: 'Input',
    info: 'To call the peaks.py script within the slurpy pipeline to analyze a ChIP-seq experiment run',
    link: 'https://github.com/lanl/SLUR-M-py?tab=readme-ov-file#for-chip-seq-experiments',
    validForm: false,
    errMessage: 'Input error.<br/>',
    inputs: {
      referenceFile: {
        text: 'Reference fasta',
        value: null,
        display: null,
        fileInput: {
          tooltip: 'Reference file in fasta format',
          enableInput: false,
          placeholder: 'Select a file',
          dataSources: ['upload', 'public', 'project'],
          fileTypes: ['fasta', 'fa', 'fna', 'contigs'],
          projectTypes: ['hic'],
          viewFile: false,
          isOptional: false,
          cleanupInput: false,
        },
      },
      controlFile: {
        text: 'Control bam',
        value: null,
        display: null,
        fileInput: {
          tooltip: 'Control file in bam format',
          enableInput: false,
          placeholder: 'Select a file',
          dataSources: ['upload', 'public', 'project'],
          fileTypes: ['bam'],
          projectTypes: ['hic'],
          viewFile: false,
          isOptional: false,
          cleanupInput: false,
        },
      },
    },
    // only for input with validation method
    validInputs: {
      referenceFile: { isValid: false, error: 'Reference fasta error.' },
      controlFile: { isValid: false, error: 'Control bam error.' },
    },
  },
}
