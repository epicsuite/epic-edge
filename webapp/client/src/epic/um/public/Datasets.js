import React from 'react'
import { Col, Row } from 'reactstrap'
import DatasetTablePublic from '../common/DatasetTablePublic'
import { apis } from '../../util'

const Datasets = (props) => {
  return (
    <Row className="justify-content-center">
      <Col xs="12" sm="12" md="8">
        <DatasetTablePublic title={'Public Datasets'} api={apis.publicDatasets} />
        <br></br>
        <br></br>
        <br></br>
      </Col>
    </Row>
  )
}

export default Datasets
