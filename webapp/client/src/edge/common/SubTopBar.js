import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { CContainer, CHeader, CHeaderNav, CNavLink, CNavItem } from '@coreui/react'

export const SubTopBar = (props) => {
  return (
    <>
      <span className="pt-3 text-muted edge-text-size-small edge-sub-top-bar">
        <NavLink
          to="/workflow/4dgb"
          className={({ isActive, isPending }) =>
            isPending ? 'pending' : isActive ? 'active' : ''
          }
        >
          4DGB Workflow
        </NavLink>
        <span className={'divide'}>|</span>
        <NavLink
          to="/user/uploads"
          className={({ isActive, isPending }) =>
            isPending ? 'pending' : isActive ? 'active' : ''
          }
        >
          Upload Files
        </NavLink>
        <span className={'divide'}>|</span>
        <NavLink
          to="/user/projects"
          className={({ isActive, isPending }) =>
            isPending ? 'pending' : isActive ? 'active' : ''
          }
        >
          My Projects
        </NavLink>
        <span className={'divide'}>|</span>
        <NavLink
          to="/public/projects"
          className={({ isActive, isPending }) =>
            isPending ? 'pending' : isActive ? 'active' : ''
          }
        >
          Public Projects
        </NavLink>
        <span className={'divide'}>|</span>
        <NavLink
          to="/user/jobQueue"
          className={({ isActive, isPending }) =>
            isPending ? 'pending' : isActive ? 'active' : ''
          }
        >
          Job Queue
        </NavLink>
      </span>
    </>
  )
}
