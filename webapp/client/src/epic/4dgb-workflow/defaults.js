import { workflowList } from 'src/util'

export const workflowOptions = [{ value: '4dgb', label: workflowList['4dgb'].label }]

export const workflows = {
  '4dgb': {
    validForm: false,
    errMessage: 'input error',
  },
}

export const mainComponents = ['projectSettings', 'datasets', 'tracks', 'annotations', 'bookmarks']

export const components = {
  projectSettings: {
    text: 'Project Settings',
    info: 'For the most part, these are used to adjust how the .hic files will be read and how LAMMPS will be run.',
    link: 'https://github.com/4DGB/4DGBWorkflow/blob/main/doc/project.md#project-required',
    validForm: false,
    errMessage: 'Chromosome error.<br/>',
    inputs: {
      resolution: {
        text: 'Resolution',
        value: 200000,
        integerInput: {
          tooltip: 'The bin resolution in the .hic files to choose. Default: 200000',
          min: 0,
          max: 100000000000,
          defaultValue: 200000,
        },
      },
      chromosome: {
        text: 'Chromosome',
        value: null,
        textInput: {
          placeholder: '(required)',
          tooltip: 'The name of the chromosome in the .hic files to choose.',
          showError: false,
          isOptional: false,
          showErrorTooltip: true,
          errMessage: 'Required.',
          defaultValue: null,
        },
      },
      count_threshold: {
        text: 'Count Threshold',
        value: 2,
        rangeInput: {
          tooltip:
            'Used to filter the contacts records from the .hic files to use in the simulation. Only records with a count higher than this will be used. Default: 2.0',
          min: 1,
          max: 15,
          step: 1,
          defaultValue: 2,
        },
      },
      distance_threshold: {
        text: 'Distance Threshold',
        value: 3.3,
        rangeInput: {
          tooltip:
            'Used to filter the contacts records from the .hic files to use in the simulation. Only records with a count higher than this will be used. Default: 2.0',
          min: 0,
          max: 10,
          step: 0.1,
          defaultValue: 3.3,
        },
      },
      blackout: {
        text: 'Blackout',
        value: [],
        rangeTextInputArray: {
          tooltip:
            'A list of 2-long arrays, each specifying a range of segments in the structure. These segments are considered "unmapped" and will not be visible by default in the browser.',
          defaultValueStart: 1,
          minStart: 1,
          maxStart: 100000000000,
          defaultValueEnd: 1,
          minEnd: 1,
          maxEnd: 100000000000,
          rangeText: 'segment range',
          startText: 'start',
          endText: 'end',
        },
      },
      bond_coeff: {
        text: 'Bond Coeff',
        value: 55,
        integerInput: {
          tooltip:
            'The FENE bond coefficient used in the LAMMPS simulation. If LAMMPS fails with a "bad FENE bond" error, try increasing this value. Default: 55',
          min: 0,
          max: 10000,
          defaultValue: 55,
        },
      },
    },
    // only for input with validation method
    validInputs: {
      resolution: { isValid: true, error: 'Resolution error.' },
      chromosome: { isValid: false, error: 'Chromosome error.' },
      blackout: { isValid: true, error: 'Blackout error.' },
      bond_coeff: { isValid: true, error: 'Bond Coeff error.' },
    },
  },
  datasets: {
    text: 'Datasets',
    info: 'A list of the two datasets to be compared in the browser. Each one is an object with the following fields:<ul><li>name: User-friendly name for the dataset</li><li>data: Path to the .hic file for the dataset</li></ul>',
    link: 'https://github.com/4DGB/4DGBWorkflow/blob/main/doc/project.md#datasets-required',
    validForm: false,
    errMessage: 'Dataset1 error.<br/>Dataset2 error.',
    inputs: {
      datasetArray: [
        {
          text: 'Dataset1',
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
            placeholder: '(Required) Select a file ...',
            dataSources: ['upload', 'public'],
            fileTypes: ['hic'],
            viewFile: false,
            isOptional: false,
            cleanupInput: false,
          },
        },
        {
          text: 'Dataset2',
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
            placeholder: '(Required) Select a file ...',
            dataSources: ['upload', 'public'],
            fileTypes: ['hic'],
            viewFile: false,
            isOptional: false,
            cleanupInput: false,
          },
        },
      ],
    },
    // only for input with validation method
    validInputs: {
      dataset0: { isValid: false, error: 'Dataset1 error.' },
      dataset1: { isValid: false, error: 'Dataset2 error.' },
    },
  },
  tracks: {
    text: 'Tracks',
    info: 'Tracks are represented in .csv files. Each track specifies a file, and the name of a column within that file.',
    link: 'https://github.com/4DGB/4DGBWorkflow/blob/main/doc/project.md#tracks-optional',
    validForm: true,
    errMessage: '',
    inputs: {
      trackArray: {
        text: 'Tracks',
        value: [],
        display: [],
      },
    },
  },
  annotations: {
    text: 'Annotations',
    info: 'Annotations are sections of the structure that you can tag with names. They can come from two different sources: Genes specified in .gff file, or arbitary features described in a .csv file.',
    link: 'https://github.com/4DGB/4DGBWorkflow/blob/main/doc/project.md#annotaions-optional',
    validForm: true,
    errMessage: '',
    inputs: {
      genes: {
        text: 'Genes',
        value: null,
        display: null,
        name: {
          text: 'Description',
          placeholder: '(Optional)',
          showError: false,
          isOptional: true,
          showErrorTooltip: true,
          errMessage: '',
        },
        data: {
          text: 'File',
          tooltip: 'Path to .gff file to use',
          enableInput: false,
          placeholder: '(Optional) Select a file ...',
          dataSources: ['upload', 'public'],
          fileTypes: ['gff'],
          viewFile: false,
          isOptional: true,
          cleanupInput: true,
        },
      },
      features: {
        text: 'Features',
        value: null,
        display: null,
        name: {
          text: 'Description',
          placeholder: '(Optional)',
          showError: false,
          isOptional: true,
          showErrorTooltip: true,
          errMessage: '',
        },
        data: {
          text: 'File',
          tooltip: 'Path to the .csv file to use',
          enableInput: false,
          placeholder: '(Optional) Select a file ...',
          dataSources: ['upload', 'public'],
          fileTypes: ['csv'],
          viewFile: false,
          isOptional: true,
          cleanupInput: true,
        },
      },
    },
  },
  bookmarks: {
    text: 'Bookmarks',
    info: 'In addition to the annotations specified above, you can bookmark your favorite locations or annotations, and they will appear in the drop-down menus to select them in the 4DGB browser.',
    link: 'https://github.com/4DGB/4DGBWorkflow/blob/main/doc/project.md#bookmarks-optional',
    validForm: true,
    errMessage: '',
    inputs: {
      locations: {
        text: 'Locations',
        value: [],
        rangeTextInputArray: {
          tooltip:
            'A list of 2-long arrays, each specifying a range of locations (in basepairs) to bookmark.',
          defaultValueStart: 1,
          minStart: 1,
          maxStart: 100000000000,
          defaultValueEnd: 1,
          minEnd: 1,
          maxEnd: 100000000000,
          rangeText: 'location range',
          startText: 'start',
          endText: 'end',
        },
      },
      features: {
        text: 'Features',
        value: [],
        textInputArray: {
          tooltip:
            'A list of names of annotations (either from the genes or features) to bookmark.',
          inputText: 'feature',
        },
      },
    },
    // only for input with validation method
    validInputs: {
      locations: { isValid: false, error: 'Locations error.' },
      features: { isValid: false, error: 'Features error.' },
    },
  },
}
