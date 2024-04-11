export const apis = {
  publicDatasets: '/api/public/datasets',
  userDatasets: '/api/auth-user/datasets',
  userDatasetsAll: '/api/auth-user/datasets/all',
  adminDatasets: '/api/admin/datasets',
  publicStructures: '/api/public/structures',
  userStructures: '/api/auth-user/structures',
  userStructuresAll: '/api/auth-user/structures/all',
  adminStructures: '/api/admin/structures',
  publicSessions: '/api/public/sessions',
  userSessions: '/api/auth-user/sessions',
  adminUSessions: '/api/admin/Sessions',
}

export const datasetUrl = process.env.REACT_APP_API_URL + '/datasets'
export const structureUrl = process.env.REACT_APP_API_URL + '/structures'

// validators
export const isValidChromosome = (name) => {
  const regexp = new RegExp(/^[a-zA-Z0-9\-_.]{3,}$/)
  return regexp.test(name.trim())
}

export const isValidTextInput = (name) => {
  const regexp = new RegExp(/^[a-zA-Z0-9\-_.\s]{1,}$/)
  return regexp.test(name.trim())
}
