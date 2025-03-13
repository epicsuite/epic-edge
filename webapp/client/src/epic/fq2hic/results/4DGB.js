import React, { useEffect, useState } from 'react'
import { Card, CardBody, Collapse } from 'reactstrap'
import { Header } from '../../../Common/Results/CardHeader'

function FDGB(props) {
  const [collapseCard, setCollapseCard] = useState(true)
  const [iframeDash, setIframeDash] = useState(0)

  const toggleCard = () => {
    setCollapseCard(!collapseCard)
    setIframeDash(1)
  }

  useEffect(() => {
    if (props.allExpand > 0) {
      setCollapseCard(false)
    }
  }, [props.allExpand])

  useEffect(() => {
    if (props.allClosed > 0) {
      setCollapseCard(true)
    }
  }, [props.allClosed])

  return (
    <Card className="workflow-result-card">
      <Header
        toggle={true}
        toggleParms={toggleCard}
        title={props.title}
        collapseParms={collapseCard}
      />
      <Collapse isOpen={!collapseCard}>
        <CardBody>
          <div className="edge-iframe-container">
            {/* <a href={process.env.REACT_APP_4DGB_VIS_URL + "/" + props.project.code + "/compare.html?gtkproject=" + props.project.code} target="_blank" rel="noreferrer">[full window view]</a> */}
            <embed
              key={iframeDash}
              src={process.env.REACT_APP_4DGB_VIS_URL + '/' + props.project.code + '/index.html'}
              className="edge-iframe"
            />
          </div>
        </CardBody>
      </Collapse>
    </Card>
  )
}

export default FDGB
