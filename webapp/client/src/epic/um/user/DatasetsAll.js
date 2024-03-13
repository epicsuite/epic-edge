import React from 'react'
import { Col, Row } from 'reactstrap'
import DatasetTableAll from '../common/DatasetTableAll'
import { apis } from '../../util'

const Datasets = (props) => {
  return (
    <Row className="justify-content-center">
      <Col xs="12" sm="12" md="8">
        <DatasetTableAll title={'All datasets available to me'} api={apis.userDatasetsAll} />
        <br></br>
        <br></br>
        <br></br>
      </Col>
    </Row>
  )
}

export default Datasets
