import React from 'react'
import { Col, Row, Button } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import DatasetTable from '../common/DatasetTable'
import { apis } from '../../util'

const Datasets = (props) => {
  const navigate = useNavigate()
  return (
    <Row className="justify-content-center">
      <Col xs="12" sm="12" md="8">
        <div className="edge-right">
          <Button
            color="primary"
            size="sm"
            className="rounded-pill"
            onClick={() => navigate('/user/datasets/all')}
            outline
          >
            &nbsp;Show all datasets available to me&nbsp;
          </Button>
        </div>
        <br></br>
        <DatasetTable
          title={'My Datasets'}
          datasetPageUrl={'/user/dataset?code='}
          api={apis.userDatasets}
        />
        <br></br>
        <br></br>
        <br></br>
      </Col>
    </Row>
  )
}

export default Datasets
