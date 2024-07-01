import React from 'react'
import { Col, Row, Badge } from 'reactstrap'
import DatasetTable from '../common/DatasetTable'

const Datasets = (props) => {
  return (
    <div className="animated fadeIn">
      <div className="clearfix">
        <Badge color="danger" pill>
          Admin tool
        </Badge>
      </div>
      <br></br>
      <DatasetTable
        title={'Manage Datasets'}
        datasetPageUrl={'/admin/dataset?code='}
        tableType={'admin'}
      />
      <br></br>
    </div>
  )
}

export default Datasets
