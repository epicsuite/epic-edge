import React from 'react'
import { Col, Row } from 'reactstrap'
import StructureTablePublic from '../common/StructureTablePublic'
import { apis } from '../../util'

const Structures = (props) => {
  return (
    <Row className="justify-content-center">
      <Col xs="12" sm="12" md="10">
        <StructureTablePublic title={'Public Structure Datasets'} api={apis.publicStructures} />
        <br></br>
        <br></br>
        <br></br>
      </Col>
    </Row>
  )
}

export default Structures
