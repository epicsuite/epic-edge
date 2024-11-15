import React from 'react'
import { Col, Row, Button } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import StructureTableAll from '../common/StructureTableAll'
import { apis } from '../../util'

const Structures = (props) => {
  const navigate = useNavigate()
  return (
    <Row className="justify-content-center">
      <Col xs="12" sm="12" md="10">
        <div className="edge-right">
          <Button
            color="primary"
            size="sm"
            className="rounded-pill"
            onClick={() => navigate('/user/structures')}
            outline
          >
            &nbsp;My structure datasets&nbsp;
          </Button>
        </div>
        <br></br>
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
