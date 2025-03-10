import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilFile, cilLockLocked, cilSettings, cilGrid, cilList, cilPeople } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import Avatar from 'react-avatar'
import { colors } from 'src/edge/common/util'

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
        {props.user && props.user.profile && props.user.profile.role === 'admin' && (
          <>
            <CDropdownHeader className="dropdown-header text-center fw-semibold py-2">
              Admin Tools
            </CDropdownHeader>
            <CDropdownItem href="/admin/projects" component={NavLink}>
              <CIcon icon={cilGrid} className="me-2" />
              Manage Projects
            </CDropdownItem>
            <CDropdownItem href="/admin/uploads" component={NavLink}>
              <CIcon icon={cilFile} className="me-2" />
              Manage Uploads
            </CDropdownItem>
            <CDropdownItem href="/admin/users" component={NavLink}>
              <CIcon icon={cilPeople} className="me-2" />
              Manage Users
            </CDropdownItem>
          </>
        )}
        <CDropdownHeader className=" text-center fw-semibold py-2">Account</CDropdownHeader>
        <CDropdownItem href="/user/profile" component={NavLink}>
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
