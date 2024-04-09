export const components = {
  dataset: {
    validForm: false,
    errMessage: 'Dataset Name error.<br/>Dataset Data error.',
    name: null,
    data: null,
    display: null,
  },
  track: {
    validForm: false,
    errMessage: 'Track error.',
    inputs: {
      track: {
        text: 'track',
        value: null,
        display: null,
        name: {
          text: 'Track Name',
          placeholder: '(required)',
          showError: false,
          isOptional: false,
          showErrorTooltip: true,
          errMessage: 'Required.',
        },
        data: {
          text: 'Track Data',
          enableInput: false,
          placeholder: '(Required) Select a file ...',
          dataSources: ['upload', 'public'],
          fileTypes: ['csv'],
          viewFile: false,
          isOptional: false,
          cleanupInput: false,
        },
      },
      columns: [
        {
          text: 'Column1',
          value: null,
          display: null,
          name: {
            text: 'Name',
            placeholder: '(required)',
            showError: false,
            isOptional: false,
            showErrorTooltip: true,
            errMessage: 'Required.',
          },
          data: {
            text: 'Data',
            enableInput: false,
            placeholder: '(Optional) Select a file ...',
            dataSources: ['upload', 'public'],
            fileTypes: ['csv'],
            viewFile: false,
            isOptional: true,
            cleanupInput: true,
          },
        },
        {
          text: 'Column2',
          value: null,
          name: {
            text: 'Name',
            placeholder: '(required)',
            showError: false,
            isOptional: false,
            showErrorTooltip: true,
            errMessage: 'Required.',
          },
          data: {
            text: 'Data',
            enableInput: false,
            placeholder: '(Optional) Select a file ...',
            dataSources: ['upload', 'public'],
            fileTypes: ['csv'],
            viewFile: false,
            isOptional: true,
            cleanupInput: true,
          },
        },
      ],
    },
    // only for input with validation method
    validInputs: {
      track: { isValid: false, error: 'Track error.' },
      column0: { isValid: false, error: 'Column1 error.' },
      column1: { isValid: false, error: 'Column2 error.' },
    },
  },
  trackArray: {
    validForm: false,
    tracks: [],
  },
}