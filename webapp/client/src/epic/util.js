export const apis = {
  publicDatasets: '/api/public/datasets',
  publicSessions: '/api/public/sessions',
  userDatasets: '/api/auth-user/datasets',
  userDatasetsAll: '/api/auth-user/datasets/all',
  userSessions: '/api/auth-user/sessions',
  adminDatasets: '/api/admin/datasets',
  adminUSessions: '/api/admin/Sessions',
}

export const datasetUrl = process.env.REACT_APP_API_URL + '/datasets'
