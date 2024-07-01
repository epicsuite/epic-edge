import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilFile,
  cilLockLocked,
  cilSettings,
  cilGrid,
  cilListNumbered,
  cilCloudUpload,
  cilList,
  cilPeople,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import Avatar from 'react-avatar'
import { colors } from '../../edge/common/util'

const AppHeaderDropdown = (props) => {
  const userName = props.user.profile
    ? props.user.profile.firstName + ' ' + props.user.profile.lastName
    : 'undefined'
  const onLogoutClick = (e) => {
    e.preventDefault()
    props.logout()
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        <Avatar name={userName} color={colors.app} size="40" round={true} />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        {'disabled' === 'on' && (
          <>
            <CDropdownHeader className="dropdown-header text-center fw-semibold py-2">
              Structure Datasets
            </CDropdownHeader>
            <CDropdownItem to="/user/structures" component={NavLink}>
              <CIcon icon={cilGrid} className="me-2" />
              My Structure Datasets
            </CDropdownItem>
            <CDropdownItem to="/user/structures-all" component={NavLink}>
              <CIcon icon={cilGrid} className="me-2" />
              All Structure Datasets Available to Me
            </CDropdownItem>
            <CDropdownHeader className="dropdown-header text-center fw-semibold py-2">
              Sessions
            </CDropdownHeader>
            <CDropdownItem to="/user/sessions" component={NavLink}>
              <CIcon icon={cilCloudUpload} className="me-2" />
              My Sessions
            </CDropdownItem>
            <CDropdownItem to="/user/sessions-all" component={NavLink}>
              <CIcon icon={cilGrid} className="me-2" />
              All Sessions Available to Me
            </CDropdownItem>
            <CDropdownHeader className="dropdown-header text-center fw-semibold py-2">
              Workflow Projects
            </CDropdownHeader>
            <CDropdownItem to="/user/projects" component={NavLink}>
              <CIcon icon={cilGrid} className="me-2" />
              My Projects
            </CDropdownItem>
            <CDropdownItem to="/user/allProjects" component={NavLink}>
              <CIcon icon={cilGrid} className="me-2" />
              All Projects Available to Me
            </CDropdownItem>
            <CDropdownItem to="/public/projects" component={NavLink}>
              <CIcon icon={cilGrid} className="me-2" />
              Public Projects
            </CDropdownItem>
            <CDropdownItem to="/user/jobQueue" component={NavLink}>
              <CIcon icon={cilGrid} className="me-2" />
              Job Queue
            </CDropdownItem>
            <CDropdownHeader className="dropdown-header text-center fw-semibold py-2">
              Data
            </CDropdownHeader>
            <CDropdownItem to="/user/uploads" component={NavLink}>
              <CIcon icon={cilGrid} className="me-2" />
              Upload Files/My Uploads
            </CDropdownItem>
          </>
        )}
        {props.user && props.user.profile && props.user.profile.role === 'admin' && (
          <>
            <CDropdownHeader className="dropdown-header text-center fw-semibold py-2">
              Admin Tools
            </CDropdownHeader>
            <CDropdownItem to="/admin/structures" component={NavLink}>
              <CIcon icon={cilList} className="me-2" />
              Manage Structure Datasets
            </CDropdownItem>
            {'disabled' === 'on' && (
              <>
                <CDropdownItem to="/admin/sessions" component={NavLink}>
                  <CIcon icon={cilFile} className="me-2" />
                  Manage Sessions
                </CDropdownItem>
              </>
            )}
            <CDropdownItem to="/admin/projects" component={NavLink}>
              <CIcon icon={cilGrid} className="me-2" />
              Manage Projects
            </CDropdownItem>
            <CDropdownItem to="/admin/uploads" component={NavLink}>
              <CIcon icon={cilFile} className="me-2" />
              Manage Uploads
            </CDropdownItem>
            <CDropdownItem to="/admin/users" component={NavLink}>
              <CIcon icon={cilPeople} className="me-2" />
              Manage Users
            </CDropdownItem>
          </>
        )}
        <CDropdownHeader className=" text-center fw-semibold py-2">Account</CDropdownHeader>
        <CDropdownItem to="/user/profile" component={NavLink}>
          <CIcon icon={cilSettings} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem onClick={onLogoutClick}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
