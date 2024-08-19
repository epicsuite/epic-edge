import axios from 'axios'
import { toast } from 'react-toastify'

export const apis = {
  publicProjects: '/api/public/projects',
  register: '/api/user/register',
  login: '/api/user/login',
  oauthLogin: '/api/user/oauthLogin',
  activate: '/api/user/activate',
  getActivationLink: '/api/user/getActivationLink',
  resetPassword: '/api/user/resetPassword',
  getResetPasswordLink: '/api/user/getResetPasswordLink',
  jobQueue: '/api/auth-user/projects/queue',
  userInfo: '/api/auth-user/info',
  userProjects: '/api/auth-user/projects',
  userAllProjects: '/api/auth-user/projects/all',
  userUsers: '/api/auth-user/users',
  userUpdate: '/api/auth-user',
  uploadsInfo: '/api/auth-user/uploads/info',
  userUploads: '/api/auth-user/uploads',
  userProjectFiles: '/api/auth-user/projects/files',
  userUploadFiles: '/api/auth-user/uploads/files',
  userPublicFiles: '/api/auth-user/data/public',
  userGlobusFiles: '/api/auth-user/data/globus',
  adminProjects: '/api/admin/projects',
  adminUsers: '/api/admin/users',
  adminUploads: '/api/admin/uploads',
}

// match colors in scss/_custom.scss
export const colors = {
  primary: '#321fdb',
  secondary: '#ced2d8',
  success: '#2eb85c',
  danger: '#e55353',
  warning: '#f9b115',
  info: '#3399ff',
  light: '#ebedef',
  dark: '#636f83',
  app: '#6a9e5d',
}

export const defaults = {
  //onSubmit, onBlur, onChange
  form_mode: 'onChange',
  showTooltip: true,
  tooltipPlace: 'right',
  tooltipColor: colors.app,
  inputStyle: { borderRadius: '5px', backgroundColor: 'white' },
  inputStyleWarning: {
    borderRadius: '5px',
    borderLeftColor: colors.danger,
    backgroundColor: 'white',
  },
}

export const workflowList = {
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
}

// set token to API request header
export const setAuthToken = (token) => {
  if (token) {
    // Apply authorization token to every request if logged in
    axios.defaults.headers.common['Authorization'] = token
  } else {
    // Delete auth header
    delete axios.defaults.headers.common['Authorization']
  }
}

// post data
export const postData = (url, params) => {
  return new Promise((resolve, reject) => {
    axios
      .post(url, params)
      .then((response) => {
        const data = response.data
        resolve(data)
      })
      .catch((err) => {
        if (err.response) {
          reject(err.response.data)
        } else {
          reject(err)
        }
      })
  })
}

// update data
export const putData = (url, params) => {
  return new Promise((resolve, reject) => {
    axios
      .put(url, params)
      .then((response) => {
        const data = response.data
        resolve(data)
      })
      .catch((err) => {
        if (err.response) {
          reject(err.response.data)
        } else {
          reject(err)
        }
      })
  })
}

// update data
export const deleteData = (url, params) => {
  return new Promise((resolve, reject) => {
    axios
      .delete(url, params)
      .then((response) => {
        const data = response.data
        resolve(data)
      })
      .catch((err) => {
        if (err.response) {
          reject(err.response.data)
        } else {
          reject(err)
        }
      })
  })
}

//fetch data
export const getData = (url) => {
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        const data = response.data
        resolve(data)
      })
      .catch((err) => {
        if (err.response) {
          reject(err.response.data)
        } else {
          reject(err)
        }
      })
  })
}

//fetch file
export const fetchFile = (url) => {
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        const data = response.data
        //console.log(data)
        resolve(data)
      })
      .catch((err) => {
        if (err.response) {
          reject(err.response.data)
        } else {
          reject(err)
        }
      })
  })
}

// action notification
export const notify = (type, msg, timeout) => {
  if (!timeout) timeout = 2000
  if (type === 'success') {
    toast.success(msg, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: timeout,
    })
  }
  if (type === 'error') {
    toast.error(msg, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: false,
    })
  }
}

// format file size
export const formatFileSize = (number) => {
  if (number < 1024) {
    return number + 'bytes'
  } else if (number >= 1024 && number < 1048576) {
    return (number / 1024).toFixed(1) + 'KB'
  } else if (number >= 1048576 && number < 1073741824) {
    return (number / 1048576).toFixed(1) + 'MB'
  } else if (number >= 1073741824) {
    return (number / 1073741824).toFixed(1) + 'GB'
  }
}

export const getFileExtension = (name) => {
  const parts = name.split('.')
  const len = parts.length
  let ext = parts[len - 1]
  if (ext === 'gz' && len > 2) {
    ext = parts[len - 2] + '.gz'
  }
  return ext.toLowerCase()
}

// ORCID login
export const popupWindow = (url, windowName, win, w, h) => {
  const y = win.top.outerHeight / 2 + win.top.screenY - h / 2
  const x = win.top.outerWidth / 2 + win.top.screenX - w / 2
  return win.open(
    url,
    windowName,
    `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`,
  )
}

// validators
export const isValidProjectName = (name) => {
  const regexp = new RegExp(/^[a-zA-Z0-9\-_.]{3,30}$/)
  return regexp.test(name.trim())
}

export const isValidFileInput = (filename, path) => {
  const regexp = new RegExp(
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)\/[a-zA-Z0-9()]{1}/,
    'i',
  )

  if (filename === path) {
    //text input must be a http(s) url
    return regexp.test(filename)
  } else {
    //input from file selector
    return true
  }
}

export const isValidFolder = (inputValue) => {
  const regexp = new RegExp(/^[a-zA-Z0-9\-_/ ]+$/, 'i')
  return regexp.test(inputValue.replace(/\s+/g, ' ').trim())
}
