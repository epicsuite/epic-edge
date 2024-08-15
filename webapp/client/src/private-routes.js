import React from 'react'

const UserProfile = React.lazy(() => import('./edge/um/user/Profile'))
const UserProjects = React.lazy(() => import('./edge/um/user/Projects'))
const UserAllProjects = React.lazy(() => import('./edge/um/user/AllProjects'))
const UserProjectPage = React.lazy(() => import('./edge/project/results/projectPage/User'))
const UserUploadFiles = React.lazy(() => import('./edge/um/user/UploadFiles'))
const UserUploads = React.lazy(() => import('./edge/um/user/Uploads'))
const UserJobQueue = React.lazy(() => import('./edge/um/user/JobQueue'))
const AdminUsers = React.lazy(() => import('./edge/um/admin/Users'))
const AdminUploads = React.lazy(() => import('./edge/um/admin/Uploads'))
const AdminProjects = React.lazy(() => import('./edge/um/admin/Projects'))
const AdminProjectPage = React.lazy(() => import('./edge/project/results/projectPage/Admin'))
const DataWorkflow = React.lazy(() => import('./edge/workflows/data/Main'))
const MetaGWorkflow = React.lazy(() => import('./edge/workflows/metagenomics/Main'))

const UserStructures = React.lazy(() => import('./epic/um/user/Structures'))
const UserStructuresAll = React.lazy(() => import('./epic/um/user/StructuresAll'))
const AdminStructures = React.lazy(() => import('./epic/um/admin/Structures'))

const FDGBWorkflow = React.lazy(() => import('./epic/4dgb-workflow/Main'))

const privateRoutes = [
  { path: '/user/profile', exact: true, name: 'Profile', element: UserProfile },
  { path: '/user/projects', exact: true, name: 'UserProjects', element: UserProjects },
  { path: '/user/allProjects', exact: true, name: 'AllProjects', element: UserAllProjects },
  { path: '/user/project', name: 'ProjectPage', element: UserProjectPage },
  { path: '/user/uploadFiles', name: 'UploadFiles', element: UserUploadFiles },
  { path: '/user/uploads', name: 'UserUploads', element: UserUploads },
  { path: '/user/jobQueue', name: 'JobQueue', element: UserJobQueue },
  { path: '/admin/users', name: 'Users', element: AdminUsers },
  { path: '/admin/uploads', name: 'AdminUploads', element: AdminUploads },
  { path: '/admin/projects', exact: true, name: 'AdminProjects', element: AdminProjects },
  { path: '/admin/project', name: 'AdminProjectPage', element: AdminProjectPage },
  { path: '/workflow/data', name: 'Data', element: DataWorkflow },
  { path: '/workflow/metagenomics', name: 'MetaG', element: MetaGWorkflow },
  { path: '/user/structures', exact: true, name: 'UserStructures', element: UserStructures },
  { path: '/user/structures-all', exact: true, name: 'UserStructures', element: UserStructuresAll },
  { path: '/admin/structures', exact: true, name: 'AdminStructures', element: AdminStructures },
  { path: '/workflow/4dgb', exact: true, name: 'Workflow', element: FDGBWorkflow },
]

export default privateRoutes
