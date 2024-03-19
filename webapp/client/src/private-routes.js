import React from 'react'

const UserDatasets = React.lazy(() => import('./epic/um/user/Datasets'))
const UserDatasetsAll = React.lazy(() => import('./epic/um/user/DatasetsAll'))
const UserSessions = React.lazy(() => import('./epic/um/user/Sessions'))
const UserProfile = React.lazy(() => import('./edge/um/user/Profile'))
const AdminUsers = React.lazy(() => import('./edge/um/admin/Users'))
const AdminDatasets = React.lazy(() => import('./epic/um/admin/Datasets'))
const AdminSessions = React.lazy(() => import('./epic/um/admin/Sessions'))

const privateRoutes = [
  { path: '/user/profile', exact: true, name: 'Profile', element: UserProfile },
  { path: '/user/datasets', exact: true, name: 'UserDatasets', element: UserDatasets },
  { path: '/user/datasets-all', exact: true, name: 'UserDatasets', element: UserDatasetsAll },
  { path: '/user/sessions', exact: true, name: 'UserSessions', element: UserSessions },
  { path: '/admin/users', exact: true, name: 'Users', element: AdminUsers },
  { path: '/admin/datasets', exact: true, name: 'AdminDatasets', element: AdminDatasets },
  { path: '/admin/sessions', exact: true, name: 'AdminSessions', element: AdminSessions },
]

export default privateRoutes
