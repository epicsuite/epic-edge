export const episcope = {
  link: 'https://github.com/epicsuite/episcope',
  info: 'A tool for exploration of epigenetic datasets',
}

export const components = {
  episcope: {
    text: 'Input',
    info: '',
    validForm: false,
    errMessage: 'Input error.<br/>',
    inputs: {
      dataPath: {
        text: '4D Genome Workflow Result Path',
        value: null,
        display: null,
        folderInput: {
          tooltip: 'Path to 4D genome result used in analysis.',
          enableInput: false,
          placeholder: 'Select a folder',
          dataSources: ['project', 'public'],
          projectTypes: ['fdgenome'],
          viewFile: false,
          isOptional: false,
          cleanupInput: false,
        },
      },
    },
    // only for input with validation method
    validInputs: {
      dataPath: { isValid: false, error: '4D Genome Result Path error.' },
    },
  },
}
