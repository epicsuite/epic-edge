import React, { useState, useEffect } from 'react'
import { Col, Row } from 'reactstrap'
import Contorls from './Controls'
import ComparativeViz from './ComparativeViz'
import Tracks from './Tracks'

const Main = (props) => {
  const [datasets, setDatasets] = useState([])
  useEffect(() => {
    // get datasets from localstorage
    if (localStorage.datasets) {
      setDatasets(JSON.parse(localStorage.getItem('datasets')))
    }
  }, [])

  return (
    <Row className="justify-content-center">
      <Col xs="12" sm="12" md="2">
        <Contorls />
      </Col>
      <Col xs="12" sm="12" md="7">
        <ComparativeViz datasets={datasets} />
      </Col>
      <Col xs="12" sm="12" md="3">
        <Tracks />
      </Col>
    </Row>
  )
}

export default Main
