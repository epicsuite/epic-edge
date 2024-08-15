import React from 'react'
import { Col, Row, Badge } from 'reactstrap'
import StructureTable from '../common/StructureTable'

const Structures = (props) => {
  return (
    <div className="animated fadeIn">
      <div className="clearfix">
        <Badge color="danger" pill>
          Admin tool
        </Badge>
      </div>
      <br></br>
      <Row className="justify-content-center">
        <Col xs="12" sm="12" md="12">
          <StructureTable
            title={'Manage Structure Datasetss'}
            structurePageUrl={'/admin/structure?code='}
            tableType={'admin'}
          />
          <br></br>
        </Col>
      </Row>
    </div>
  )
}

export default Structures
