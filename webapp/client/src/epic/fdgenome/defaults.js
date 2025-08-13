import { workflowList } from 'src/util'

export const fdgenome = {
  label: '4D Genome',
  category: 'epic workflow',
  title: '4D Genome',
  name: 'fdgenome',
  inputLink: 'https://github.com/epicsuite/workflow/tree/main',
  link: 'https://github.com/lanl/SLUR-M-py',
  info: 'This workflow transforms fastq files and other related datasets into time-based 4D datasets. The results can be viewed in a visualization tool we are developing, but are also available for other types of analysis and processing.',
}

export const workflowOptions = [{ value: 'fdgenome', label: workflowList['fdgenome'].label }]

export const components = {
  fdgenome: {
    text: 'Input',
    validForm: false,
    errMessage: 'Input error.<br/>',
    inputs: {
      inputFastq: {
        text: 'Input Raw Reads',
        value: [],
        display: [],
        fastqInput: {
          tooltip:
            '4D Genome workflow requires paired-end Illumina data in FASTQ format as the input; the file must be compressed. <br/>Acceptable file formats: .fastq.gz, .fq.gz',
          enableInput: false,
          placeholder: 'Select a file',
          dataSources: ['upload', 'public'],
          fileTypes: ['fastq.gz', 'fq.gz'],
          viewFile: false,
          isOptional: false,
          cleanupInput: false,
          maxInput: 100,
          paired: true,
          disableSwitcher: true,
        },
      },
      refix: {
        text: 'Reference Fasta',
        value: null,
        display: null,
        fileInput: {
          tooltip:
            'Path to input reference referecne (in .fasta or .fa format) with an assoicated (.fai) bwa index to use for alignment.',
          enableInput: false,
          placeholder: 'Select a file',
          dataSources: ['upload', 'public'],
          fileTypes: ['fasta', 'fa'],
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
      genomelist: {
        text: 'Genome List File',
        value: null,
        display: null,
        fileInput: {
          tooltip:
            'Path to list of chromosomes (by name) to include in final analysis. Default behavior expects a tab seperated tsv or bed, comma seperated csv, or space seperated txt file with no header.',
          enableInput: false,
          placeholder: 'Select a file',
          dataSources: ['upload', 'public'],
          fileTypes: ['tsv', 'csv', 'txt', 'bed'],
          viewFile: false,
          isOptional: false,
          cleanupInput: false,
        },
      },
      chromosomes: {
        text: 'Chromosomes',
        value: '1,2',
        textInput: {
          placeholder: '(required)',
          tooltip: 'List of chromosomes to include in the analysis, separated by commas.',
          showError: false,
          isOptional: false,
          showErrorTooltip: true,
          errMessage: 'Required.',
          defaultValue: '1,2',
        },
      },
    },
    // only for input with validation method
    validInputs: {
      inputFastq: { isValid: false, error: 'Input Fastq error.' },
      refix: { isValid: false, error: 'Reference File error.' },
      mtDNA: { isValid: true, error: 'Name of Mitochondrial Contig error.' },
      genomelist: { isValid: false, error: 'Genome List File error.' },
      chromosomes: { isValid: true, error: 'Chromosomes error.' },
    },
  },
}
