import React, { useState } from 'react'
import { Row, Col } from 'reactstrap'
import { SubTopBar } from 'src/edge/common/SubTopBar'
import UploadTable from '../common/UploadTable'
import UploadFiles from './UploadFiles'

const Uploads = (props) => {
  const [refreshTable, setRefreshTable] = useState(0)

  const reloadTableData = () => {
    setRefreshTable(refreshTable + 1)
  }
  return (
    <div className="animated fadeIn">
      <Row className="justify-content-center">
        <Col xs="12" sm="12" md="10">
          {process.env.REACT_APP_SUBTOPBAR === 'on' && <SubTopBar active={'uploads'} />}
          <UploadFiles reloadTableData={reloadTableData} />
          <br></br>
          <br></br>
          <UploadTable tableType={'user'} title={'My Uploads'} refresh={refreshTable} />
          <br></br>
        </Col>
      </Row>
    </div>
  )
}

export default Uploads
