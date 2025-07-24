import React, { useState, useEffect } from 'react'
import { Card, CardBody, Col, Row, Collapse } from 'reactstrap'
import { Header } from 'src/edge/project/forms/SectionHeader'
import UploadTable from 'src/edge/um/common/UploadTable'
import UploadFiles from '../../edge/um/user/UploadFiles'

export const UploadData = (props) => {
  const componentName = 'uploadData'
  const [collapseParms, setCollapseParms] = useState(true)
  const [refreshTable, setRefreshTable] = useState(0)

  const reloadTableData = () => {
    setRefreshTable(refreshTable + 1)
  }

  const toggleParms = () => {
    setCollapseParms(!collapseParms)
  }

  return (
    <Card className="workflow-card">
      <Header
        toggle={true}
        toggleParms={toggleParms}
        title={props.title}
        collapseParms={collapseParms}
        id={'upload-files'}
        isValid={props.isValid}
      />
      <Collapse isOpen={!collapseParms} id={'collapseParameters-' + props.name}>
        <CardBody>
          <UploadFiles
            reloadTableData={reloadTableData}
            extensions={props.extensions}
            info={props.info}
          />
          <br></br>
          <br></br>
          <UploadTable tableType={'user'} title={'My Uploads'} refresh={refreshTable} />
          <br></br>
        </CardBody>
      </Collapse>
    </Card>
  )
}
