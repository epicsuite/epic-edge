import React from 'react'
import DatasetTable from '../common/DatasetTable'
import { apis } from 'src/edge/common/util'

const Sessions = (props) => {
  return (
    <>
      <DatasetTable
        title={'My Sessions'}
        sessionPageUrl={'/admin/session?code='}
        api={apis.adminSessions}
      />
      <br></br>
    </>
  )
}

export default Sessions
