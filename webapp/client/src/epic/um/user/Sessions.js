import React from 'react'
import DatasetTable from '../common/DatasetTable'
import { apis } from '../../../edge/common/util'

const Sessions = (props) => {
  return (
    <>
      <DatasetTable
        title={'My Sessions'}
        sessionPageUrl={'/user/session?code='}
        api={apis.userSessions}
      />
      <br></br>
    </>
  )
}

export default Sessions
