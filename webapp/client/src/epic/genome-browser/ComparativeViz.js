import React, { useState, useEffect } from 'react'
import { Col, Row } from 'reactstrap'
import DataViz from './DataViz'

const ComparativeViz = (props) => {
  const [datasetPairs, setDatasetPairs] = useState([])

  useEffect(() => {
    //split datasets to pairs for viewing
    let pairs = []
    let pair = []
    props.datasets.forEach(function (data, index) {
      if (index % 2 === 0) {
        //reset
        pair = []
        pair[0] = data
      } else {
        pair[1] = data
        //add to pairs
        pairs.push(pair)
      }
    })
    //if the length of the datasets is odd
    if (pair[0] && !pair[1]) {
      pairs.push(pair)
    }
    setDatasetPairs(pairs)
  }, [props])

  return (
    <>
      Comparative Viz
      <br></br>
      <br></br>
      {datasetPairs.length > 0 &&
        datasetPairs.map((datasetPair, index) => {
          if (datasetPair[1]) {
            return (
              <React.Fragment key={index}>
                <Row className="justify-content-center" key={index}>
                  <Col xs="12" sm="12" md="6" key={index + '-1'}>
                    <DataViz dataset={datasetPair[0]} key={index + 'viz1'} />
                  </Col>
                  <Col xs="12" sm="12" md="6" key={index + '-2'}>
                    <DataViz dataset={datasetPair[1]} key={index + 'viz'} />
                  </Col>
                </Row>
                <br></br>
              </React.Fragment>
            )
          } else {
            return (
              <React.Fragment key={index}>
                <Row className="justify-content-center" key={index}>
                  <Col xs="12" sm="12" md="6" key={index + '-1'}>
                    <DataViz dataset={datasetPair[0]} key={index + 'viz1'} />
                  </Col>
                  <Col xs="12" sm="12" md="6" key={index + '-2'}>
                    &nbsp;
                  </Col>
                </Row>
                <br></br>
              </React.Fragment>
            )
          }
        })}
    </>
  )
}

export default ComparativeViz
