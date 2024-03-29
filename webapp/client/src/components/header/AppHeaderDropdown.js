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
        <CDropdownHeader className="dropdown-header text-center fw-semibold py-2">
          Datasets
        </CDropdownHeader>
        <CDropdownItem to="/user/datasets" component={NavLink}>
          <CIcon icon={cilGrid} className="me-2" />
          My Datasets
        </CDropdownItem>
        <CDropdownItem to="/user/datasets-all" component={NavLink}>
          <CIcon icon={cilGrid} className="me-2" />
          All Datasets Available to Me
        </CDropdownItem>
        {'disabled' === 'on' && (
          <>
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
          </>
        )}
        {props.user && props.user.profile && props.user.profile.role === 'admin' && (
          <>
            <CDropdownHeader className="dropdown-header text-center fw-semibold py-2">
              Admin Tools
            </CDropdownHeader>
            <CDropdownItem to="/admin/datasets" component={NavLink}>
              <CIcon icon={cilList} className="me-2" />
              Manage Datasets
            </CDropdownItem>
            {'disabled' === 'on' && (
              <>
                <CDropdownItem to="/admin/sessions" component={NavLink}>
                  <CIcon icon={cilFile} className="me-2" />
                  Manage Sessions
                </CDropdownItem>
              </>
            )}
            <CDropdownItem to="/admin/users" component={NavLink}>
              <CIcon icon={cilPeople} className="me-2" />
              Manage Users
            </CDropdownItem>
          </>
        )}
        <CDropdownHeader className=" text-center fw-semibold py-2">Account</CDropdownHeader>
        {/* <CDropdownItem to="/user/profile" component={NavLink}>
          <CIcon icon={cilSettings} className="me-2" />
          Profile
        </CDropdownItem> */}
        <CDropdownItem onClick={onLogoutClick}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
