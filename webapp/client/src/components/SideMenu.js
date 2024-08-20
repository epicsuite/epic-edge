import React from 'react'
import { NavLink } from 'react-router-dom'

export const SideMenu = (props) => {
  return (
    <>
      <br></br>
      <br></br>
      <span style={{ fontSize: '1.0em', paddingLeft: '30px', color: '#c4c9d0' }}>WORKFLOWS</span>
      <div className="pt-3 text-muted edge-side-menu">
        <NavLink
          to="/workflow/4dgb"
          className={({ isActive, isPending }) =>
            isPending ? 'pending' : isActive ? 'active' : ''
          }
        >
          4DGB
        </NavLink>
        <br></br>
        <br></br>
        <NavLink
          to="/workflow/slurpy"
          className={({ isActive, isPending }) =>
            isPending ? 'pending' : isActive ? 'active' : ''
          }
        >
          Slurpy
        </NavLink>
      </div>
      <br></br>
      <br></br>
      <span style={{ fontSize: '1.0em', paddingLeft: '30px', color: '#c4c9d0' }}>TOOLS</span>
      <div className="pt-3 text-muted edge-side-menu">
        <NavLink
          to="/public/projects"
          className={({ isActive, isPending }) =>
            isPending ? 'pending' : isActive ? 'active' : ''
          }
        >
          Public Projects
        </NavLink>
        <br></br>
        <br></br>
        <NavLink
          to="/user/projects"
          className={({ isActive, isPending }) =>
            isPending ? 'pending' : isActive ? 'active' : ''
          }
        >
          My Projects
        </NavLink>
        <br></br>
        <br></br>
        <NavLink
          to="/user/jobQueue"
          className={({ isActive, isPending }) =>
            isPending ? 'pending' : isActive ? 'active' : ''
          }
        >
          Job Queue
        </NavLink>
        <br></br>
        <br></br>
        <NavLink
          to="/user/uploads"
          className={({ isActive, isPending }) =>
            isPending ? 'pending' : isActive ? 'active' : ''
          }
        >
          Upload Files
        </NavLink>
      </div>
    </>
  )
}
