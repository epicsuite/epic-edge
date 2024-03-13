import React from 'react'
import UploadTable from '../common/UploadTable'

const Uploads = (props) => {
  return (
    <div className="animated fadeIn">
      <UploadTable tableType="user" title={'Manage Uploads'} {...props} />
      <br></br>
    </div>
  )
}

export default Uploads
