import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilHome, cilGrid, cilCloudUpload, cilLayers } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Home',
    to: '/home',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Public Projects',
    to: '/public/projects',
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Upload Files',
    to: '/user/uploadfiles',
    icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Workflows',
  },
  {
    component: CNavGroup,
    name: 'Data',
    icon: <CIcon icon={cilLayers} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Run a Single Workflow',
        to: '/workflow/data',
        badge: {
          color: 'info',
          text: '1',
        },
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Metagenomics',
    icon: <CIcon icon={cilLayers} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Run a Single Workflow',
        to: '/workflow/metagenomics',
        badge: {
          color: 'info',
          text: '1',
        },
      },
    ],
  },
]

export default _nav
