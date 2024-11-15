import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { CCloseButton, CSidebar, CSidebarBrand, CSidebarHeader } from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'

import logo from 'src/assets/img/brand/logo.png'

// sidebar nav config
import navigation from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = false
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch(setSidebar(visible))
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
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
        <CCloseButton className="d-lg-none" dark onClick={() => dispatch(setSidebar(false))} />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
