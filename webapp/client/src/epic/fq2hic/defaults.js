import { workflowList } from 'src/util'

export const workflowOptions = [{ value: 'fq2hic', label: workflowList['fq2hic'].label }]

export const workflows = {
  fq2hic: {
    validForm: false,
    errMessage: 'input error',
  },
}

export const mainComponents = ['workflowInput']

export const components = {
  workflowInput: {
    text: 'Workflow Input',
    info: 'The csv file, which describes the datasets to be compared. ',
    link: 'https://github.com/epicsuite/workflow/blob/main/workflow.md#step-1-data-upload-and-workflow-definition',
    validForm: false,
    errMessage: 'Chromosome error.<br/>',
    inputs: {
      csvFile: {
        text: 'Experimental Design',
        value: null,
        fileInput: {
          tooltip:
            'A csv file which describes the datasets to be compared.<br/> Note: The file path should be &lt;folder name&gt;/&lt;your uploaded fastq file name&gt;.<br/> Example: <br/> main/filename0.0.fastq',
          optional: false,
          extensions: '.csv',
        },
      },
      cellLine: {
        text: 'Cell Line',
        value: null,
        textInput: {
          placeholder: '(required)',
          tooltip: null,
          showError: false,
          isOptional: false,
          showErrorTooltip: true,
          errMessage: 'Required.',
          defaultValue: null,
        },
      },
      description: {
        text: 'Description',
        value: null,
        textInput: {
          placeholder: '(required)',
          tooltip: '',
          showError: false,
          isOptional: false,
          showErrorTooltip: true,
          errMessage: 'Required.',
          defaultValue: null,
        },
      },
      experiment: {
        text: 'Experiment',
        value: null,
        textInput: {
          placeholder: '(required)',
          tooltip: '',
          showError: false,
          isOptional: false,
          showErrorTooltip: true,
          errMessage: 'Required.',
          defaultValue: null,
        },
      },
      replicate: {
        text: 'Replicate',
        value: 1,
        integerInput: {
          tooltip: '',
          min: 0,
          max: 100000000000,
          defaultValue: 1,
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
      timeUnits: {
        text: 'Time Units',
        value: 'hr',
        textInput: {
          placeholder: '(required)',
          tooltip: '',
          showError: false,
          isOptional: false,
          showErrorTooltip: true,
          errMessage: 'Required.',
          defaultValue: 'hr',
        },
      },
      timeValues: {
        text: 'Time Values',
        value: null,
        textInput: {
          placeholder: '(Required. Example: 24, 48, ..., N)',
          tooltip: '',
          showError: false,
          isOptional: false,
          showErrorTooltip: true,
          errMessage: 'Required.',
          defaultValue: null,
        },
      },
      treatments: {
        text: 'Treatments',
        value: null,
        textInput: {
          placeholder: '(Required. Example: one, two)',
          tooltip: '',
          showError: false,
          isOptional: false,
          showErrorTooltip: true,
          errMessage: 'Required.',
          defaultValue: null,
        },
      },
    },
    // only for input with validation method
    validInputs: {
      csvFile: { isValid: false, error: 'Experimental Design error.' },
      cellLine: { isValid: false, error: 'Cell Line error.' },
      description: { isValid: false, error: 'Description error.' },
      experiment: { isValid: false, error: 'Experiment error.' },
      replicate: { isValid: true, error: 'Replicate error.' },
      resolution: { isValid: true, error: 'Resolution error.' },
      timeUnits: { isValid: true, error: 'Time Units error.' },
      timeValues: { isValid: false, error: 'Time Values error.' },
      treatments: { isValid: false, error: 'Treatments error.' },
    },
  },
}
