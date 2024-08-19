import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CContainer, CHeader, CHeaderNav, CNavLink, CNavItem } from '@coreui/react'

import { AppHeaderDropdown } from './header/index'
import logo from '../assets/img/brand/logo.png'
import { logout } from '../redux/reducers/edge/userSlice'

const AppHeader = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)

  const signOut = (e) => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <CHeader position="sticky" className="mb-4 edge-header">
      <CContainer fluid>
        <CHeaderNav className="d-md-flex">
          <CNavItem>
            <a href="/home">
              <img alt="logo" style={{ width: 60, height: 50 }} src={logo} />
            </a>
          </CNavItem>
          <CNavItem className="d-flex align-items-center">
            <span
              style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', fontFamily: 'Roboto' }}
            >
              &nbsp;&nbsp;&nbsp;EPIC EDGE Portal
            </span>
          </CNavItem>
        </CHeaderNav>
        {user.isAuthenticated ? (
          <>
            <CHeaderNav className="ms-auto">
              <CNavItem>
                <CNavLink
                  style={{ color: 'white' }}
                  className="edge-header-nav-link"
                  to="/home"
                  component={NavLink}
                >
                  Home
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  style={{ color: 'white' }}
                  className="edge-header-nav-link"
                  to="/user/structures-all"
                  component={NavLink}
                >
                  Structure Datasets
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  style={{ color: 'white' }}
                  className="edge-header-nav-link"
                  to="/workflow/slurpy"
                  component={NavLink}
                >
                  Workflows
                </CNavLink>
              </CNavItem>
            </CHeaderNav>
            <CHeaderNav className="ms-3">
              <AppHeaderDropdown
                style={{ color: 'white' }}
                className="edge-header-nav-link"
                user={user}
                logout={(e) => signOut(e)}
              />
            </CHeaderNav>
          </>
        ) : (
          <>
            <CHeaderNav className="ms-auto">
              <CNavItem>
                <CNavLink
                  style={{ color: 'white' }}
                  className="edge-header-nav-link"
                  to="/home"
                  component={NavLink}
                >
                  Home
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  style={{ color: 'white' }}
                  className="edge-header-nav-link"
                  to="/public/structures"
                  component={NavLink}
                >
                  Structure Datasets
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  style={{ color: 'white' }}
                  className="edge-header-nav-link"
                  to="/public/projects"
                  component={NavLink}
                >
                  Workflows
                </CNavLink>
              </CNavItem>
              <CNavLink style={{ color: 'white' }} className="edge-header-nav-link" href="/login">
                Login
              </CNavLink>
            </CHeaderNav>
          </>
        )}
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
