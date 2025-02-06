export const compare = {
  link: 'https://github.com/epicsuite/epicview/tree/main/compare',
  info: 'A comparative viewer paraview state file for the epic project. When loaded into ParaView 5.13 or later, the user can choose two properly defined epic structure files for comparative viewing.',
}

export const components = {
  compare: {
    text: 'Input',
    info: 'The application requires two paraview vtp files.',
    validForm: false,
    errMessage: 'Input error.<br/>',
    inputs: {
      leftVtpFile: {
        text: 'Left paraview vtp file',
        value: null,
        display: null,
        fileInput: {
          tooltip: 'Path to left vtp file used in analysis.',
          enableInput: false,
          placeholder: 'Select a file',
          dataSources: ['upload', 'public'],
          fileTypes: ['vtp'],
          viewFile: false,
          isOptional: false,
          cleanupInput: false,
        },
      },
      rightVtpFile: {
        text: 'Right paraview vtp file',
        value: null,
        display: null,
        fileInput: {
          tooltip: 'Path to right vtp file used in analysis.',
          enableInput: false,
          placeholder: 'Select a file',
          dataSources: ['upload', 'public'],
          fileTypes: ['vtp'],
          viewFile: false,
          isOptional: false,
          cleanupInput: false,
        },
      },
    },
    // only for input with validation method
    validInputs: {
      leftVtpFile: { isValid: false, error: 'Left paraview vtp file error.' },
      rightVtpFile: { isValid: false, error: 'Right paraview vtp file error.' },
    },
  },
}
