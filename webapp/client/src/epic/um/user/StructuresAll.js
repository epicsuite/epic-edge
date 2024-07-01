import React from 'react'
import { Col, Row } from 'reactstrap'
import StructureTableAll from '../common/StructureTableAll'
import { apis } from '../../util'

const Structures = (props) => {
  return (
    <Row className="justify-content-center">
      <Col xs="12" sm="12" md="12">
        <StructureTableAll
          title={'All structure datasets available to me'}
          api={apis.userStructuresAll}
        />
        <br></br>
        <br></br>
        <br></br>
      </Col>
    </Row>
  )
}

export default Structures
