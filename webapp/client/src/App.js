import React, { Component, Suspense } from 'react'
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
// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

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

class App extends Component {
  constructor(props) {
    super(props)
    this.events = ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress']
    this.logout = this.logout.bind(this)
    this.resetTimeout = this.resetTimeout.bind(this)
  }

  addTimeout() {
    for (var i in this.events) {
      window.addEventListener(this.events[i], this.resetTimeout)
    }

    this.setTimeout()
  }

  clearTimeout() {
    if (this.logoutTimeout) clearTimeout(this.logoutTimeout)
  }

  setTimeout() {
    // 3600 * 1000 = 60mins
    this.logoutTimeout = setTimeout(this.logout, 3600 * 100000)
  }

  resetTimeout() {
    this.clearTimeout()
    this.setTimeout()
  }

  logout() {
    alert("You've been logged out due to inactivity.")
    // Send a logout request to the API
    store.dispatch(logout())
    // Redirect to login
    window.location.href = './'
    this.destroy() // Cleanup
  }

  destroy() {
    this.clearTimeout()

    for (var i in this.events) {
      window.removeEventListener(this.events[i], this.resetTimeout)
    }
  }

  componentDidMount() {
    // If logged in, add timeout
    if (localStorage.jwtToken) {
      this.addTimeout()
    }
  }

  render() {
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
}

export default App
