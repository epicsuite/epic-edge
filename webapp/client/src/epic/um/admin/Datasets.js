import React from 'react'
import DatasetTable from '../common/DatasetTable'
import { apis } from '../../../edge/common/util'

const Datasets = (props) => {
  return (
    <>
      <DatasetTable
        title={'My Datasets'}
        datasetPageUrl={'/admin/dataset?code='}
        api={apis.adminDatasets}
      />
      <br></br>
    </>
  )
}

export default Datasets
