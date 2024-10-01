import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { setUser, logout } from './redux/reducers/edge/userSlice'
import { jwtDecode } from 'jwt-decode'
import { setAuthToken } from './edge/common/util'
import store from './redux/store'

import './scss/style.scss'

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// Check for token to keep user logged in
if (localStorage.jwtToken) {
  // Set auth token header auth
  const token = localStorage.jwtToken
  setAuthToken(token)
  // Decode token and get user info and exp
  const decoded = jwtDecode(token)
  // Set user and isAuthenticated
  store.dispatch(
    setUser({
      isAuthenticated: true,
      profile: decoded,
    }),
  )
} else {
  store.dispatch(logout())
}
//logout all tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'jwtToken' && e.oldValue && !e.newValue) {
    store.dispatch(logout())
  }
})

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

const App = () => {
  return (
    <Router>
      <Suspense fallback={loading}>
        <Routes>
          <Route path="*" name="Home" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
