import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSidebar } from '../redux/reducers/sidebarSlice'
import { CSidebar, CSidebarBrand, CSidebarNav } from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'

import logo from 'src/assets/img/brand/logo.png'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'

// sidebar nav config
import navigation from '../_nav'

const AppSidebar = () => {
  const unfoldable = false
  const sidebarShow = useSelector((state) => state.sidebar.sidebarShow)
  const dispatch = useDispatch()

  return (
    <CSidebar
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch(setSidebar(visible))
      }}
    >
      <CSidebarBrand className="d-none d-md-flex" to="/home">
        <span className="sidebar-brand-full">
          <img alt="logo" style={{ width: 40, height: 40 }} src={logo} />
        </span>
        <a className="c-header-brand edge-text-font" href="/home">
          &nbsp;LANL Bioinformatics
        </a>
        <span className="sidebar-brand-narrow">
          <img alt="logo" style={{ width: 20, height: 20 }} src={logo} />
        </span>
      </CSidebarBrand>
      <CSidebarNav>
        <SimpleBar>
          <AppSidebarNav items={navigation} />
        </SimpleBar>
      </CSidebarNav>
      <div className="app-color">EDGE V3</div>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
