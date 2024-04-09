import React from 'react'

// const Home = React.lazy(() => import('./edge/Home'))
const PublicProjects = React.lazy(() => import('./edge/um/public/Projects'))
const PublicProjectPage = React.lazy(() => import('./edge/project/results/projectPage/Public'))
const UserRegister = React.lazy(() => import('./edge/um/user/Register'))
const UserLogin = React.lazy(() => import('./edge/um/user/Login'))
const OAuth = React.lazy(() => import('./edge/um/user/ORCIDOAuthCallback'))
const UserActivate = React.lazy(() => import('./edge/um/user/Activate'))
const UserResetPassword = React.lazy(() => import('./edge/um/user/ResetPassword'))
const Home = React.lazy(() => import('./epic/Home'))
const PublicDatasets = React.lazy(() => import('./epic/um/public/Datasets'))
const PublicSessions = React.lazy(() => import('./epic/um/public/Sessions'))
const GenomeBrowser = React.lazy(() => import('./epic/genome-browser/Main'))
const Trame = React.lazy(() => import('./epic/trame/Main'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/home', name: 'Home', element: Home },
  { path: '/public/projects', name: 'PublicProjects', element: PublicProjects },
  { path: '/public/project', name: 'PublicProjectPage', element: PublicProjectPage },
  { path: '/register', exact: true, name: 'Register', element: UserRegister },
  { path: '/login', exact: true, name: 'Login', element: UserLogin },
  { path: '/oauth', name: 'OAuth', element: OAuth },
  { path: '/activate', exact: true, name: 'Activate', element: UserActivate },
  { path: '/resetPassword', exact: true, name: 'ResetPassword', element: UserResetPassword },
  { path: '/public/datasets', exact: true, name: 'PublicDatasets', element: PublicDatasets },
  { path: '/public/sessions', exact: true, name: 'PublicSessions', element: PublicSessions },
  { path: '/genomeBrowser', exact: true, name: 'GenomeBrowser', element: GenomeBrowser },
  { path: '/trame', exact: true, name: 'Trame', element: Trame },
]

export default routes
