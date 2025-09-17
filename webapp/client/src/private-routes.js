import React from 'react'

const UserProfile = React.lazy(() => import('./edge/um/user/Profile'))
const UserProjects = React.lazy(() => import('./epic/edge/um/user/Projects'))
const UserAllProjects = React.lazy(() => import('./epic/edge/um/user/AllProjects'))
const UserProjectPage = React.lazy(() => import('./epic/edge/project/results/projectPage/User'))
const UserUploads = React.lazy(() => import('./epic/edge/um/user/Uploads'))
const UserJobQueue = React.lazy(() => import('./epic/edge/um/user/JobQueue'))
const AdminUsers = React.lazy(() => import('./edge/um/admin/Users'))
const AdminUploads = React.lazy(() => import('./edge/um/admin/Uploads'))
const AdminProjects = React.lazy(() => import('./edge/um/admin/Projects'))
const AdminProjectPage = React.lazy(() => import('./edge/project/results/projectPage/Admin'))
const MetaGWorkflow = React.lazy(() => import('./edge/workflows/metagenomics/Main'))

const FdgenomeWorkflow = React.lazy(() => import('./epic/fdgenome/Main'))
const SlurpyWorkflow = React.lazy(() => import('./epic/slurpy/Main'))
const Fq2hicWorkflow = React.lazy(() => import('./epic/fq2hic/Main'))
const ComparativeViewer = React.lazy(() => import('./epic/comparative-viewer/Main'))
const Episcope = React.lazy(() => import('./epic/episcope/Main'))

const privateRoutes = [
  { path: '/user/profile', exact: true, name: 'Profile', element: UserProfile },
  { path: '/user/projects', exact: true, name: 'UserProjects', element: UserProjects },
  { path: '/user/allProjects', exact: true, name: 'AllProjects', element: UserAllProjects },
  { path: '/user/project', name: 'ProjectPage', element: UserProjectPage },
  { path: '/user/uploads', name: 'UserUploads', element: UserUploads },
  { path: '/user/jobQueue', name: 'JobQueue', element: UserJobQueue },
  { path: '/admin/users', name: 'Users', element: AdminUsers },
  { path: '/admin/uploads', name: 'AdminUploads', element: AdminUploads },
  { path: '/admin/projects', exact: true, name: 'AdminProjects', element: AdminProjects },
  { path: '/admin/project', name: 'AdminProjectPage', element: AdminProjectPage },
  { path: '/workflow/metagenomics', name: 'MetaG', element: MetaGWorkflow },
  { path: '/workflow/4dgenome', exact: true, name: '4dgenome', element: FdgenomeWorkflow },
  { path: '/workflow/slurpy', exact: true, name: 'slurpy', element: SlurpyWorkflow },
  { path: '/workflow/fq2hic', exact: true, name: 'slurpy', element: Fq2hicWorkflow },
  { path: '/user/comparative-viewer', exact: true, name: 'compare', element: ComparativeViewer },
  { path: '/user/episcope', exact: true, name: 'episcope', element: Episcope },
]

export default privateRoutes
