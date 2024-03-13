import React from 'react'

const Home = React.lazy(() => import('./epic/Home'))
const GenomeBrowser = React.lazy(() => import('./epic/genome-browser/Main'))
const PublicDatasets = React.lazy(() => import('./epic/um/public/Datasets'))
const PublicSessions = React.lazy(() => import('./epic/um/public/Sessions'))
const UserRegister = React.lazy(() => import('./edge/um/user/Register'))
const UserLogin = React.lazy(() => import('./edge/um/user/Login'))
const UserActivate = React.lazy(() => import('./edge/um/user/Activate'))
const UserResetPassword = React.lazy(() => import('./edge/um/user/ResetPassword'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/home', name: 'Home', element: Home },
  { path: '/genomeBrowser', exact: true, name: 'GenomeBrowser', element: GenomeBrowser },
  { path: '/public/datasets', exact: true, name: 'PublicDatasets', element: PublicDatasets },
  { path: '/public/sessions', exact: true, name: 'PublicSessions', element: PublicSessions },
  { path: '/register', exact: true, name: 'Register', element: UserRegister },
  { path: '/login', exact: true, name: 'Login', element: UserLogin },
  { path: '/activate', exact: true, name: 'Activate', element: UserActivate },
  { path: '/resetPassword', exact: true, name: 'ResetPassword', element: UserResetPassword },
]

export default routes
