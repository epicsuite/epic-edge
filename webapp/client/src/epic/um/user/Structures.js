import React from 'react'
import { Col, Row, Button } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import StructureTable from '../common/StructureTable'

const Structures = (props) => {
  const navigate = useNavigate()
  return (
    <Row className="justify-content-center">
      <Col xs="12" sm="12" md="12">
        <div className="edge-right">
          <Button
            color="primary"
            size="sm"
            className="rounded-pill"
            onClick={() => navigate('/user/structures-all')}
            outline
          >
            &nbsp;Show all structure datasets available to me&nbsp;
          </Button>
        </div>
        <br></br>
        <StructureTable
          title={'My Structure Datasets'}
          structurePageUrl={'/user/structure?code='}
          tableType={'user'}
        />
        <br></br>
        <br></br>
        <br></br>
      </Col>
    </Row>
  )
}

export default Structures
