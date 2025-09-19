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
  reference: {
    text: 'Reference',
    validForm: false,
    errMessage: 'Reference input error.<br/>',
    inputs: {
      sequence: {
        text: 'Sequence',
        value: null,
        display: null,
        fileInput: {
          tooltip:
            "Path to input reference fasta (in .fna format), source of the project's list of chromosomes.",
          enableInput: false,
          placeholder: 'Select a file',
          dataSources: ['upload', 'public'],
          fileTypes: ['fna'],
          viewFile: false,
          isOptional: false,
          cleanupInput: false,
        },
      },
      annotation: {
        text: 'Annotation',
        value: null,
        display: null,
        fileInput: {
          tooltip: 'Path to .gff file.',
          enableInput: false,
          placeholder: 'Select a file',
          dataSources: ['upload', 'public'],
          fileTypes: ['gff'],
          viewFile: false,
          isOptional: true,
          cleanupInput: true,
        },
      },
      mitochondria: {
        text: 'Mitochondria',
        value: '',
        textInput: {
          placeholder: '(some genomes do not have it)',
          tooltip: 'Some accession number',
          showError: false,
          isOptional: true,
          showErrorTooltip: true,
          errMessage: '',
          defaultValue: '',
        },
      },
      resolution: {
        text: 'Resolution',
        value: 100000,
        integerInput: {
          tooltip: 'The bin resolution in the .hic files to choose. Default: 100000',
          min: 0,
          max: 100000000000,
          defaultValue: 100000,
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
        value: '',
        textInput: {
          placeholder: '(required)',
          tooltip: 'List of chromosomes to include in the analysis, separated by commas.',
          showError: false,
          isOptional: false,
          showErrorTooltip: true,
          errMessage: 'Required.',
          defaultValue: '',
        },
      },
    },
    // only for input with validation method
    validInputs: {
      sequence: { isValid: false, error: 'Reference File error.' },
      mitochondria: { isValid: false, error: 'Mitochondria error.' },
      resolution: { isValid: true, error: 'Resolution error.' },
      genomelist: { isValid: false, error: 'Genome List File error.' },
      chromosomes: { isValid: true, error: 'Chromosomes error.' },
    },
  },
  experiments: {
    text: 'Experiments',
    validForm: false,
    errMessage: 'Experiment input error.<br/>',
    inputs: {
      value: [],
      display: [],
    },
  },
}
