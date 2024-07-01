import React from 'react'
import { Badge, Col, Row } from 'reactstrap'
import { SideMenu } from 'src/components/SideMenu'
import ProjectTable from '../common/ProjectTable'

const Projects = (props) => {
  return (
    <Row className="justify-content-center">
      <Col xs="12" sm="12" md="2">
        <SideMenu />
      </Col>
      <Col xs="12" sm="12" md="10">
        <Row className="justify-content-center">
          <Col xs="12" sm="12" md="10">
            <div className="clearfix">
              <Badge color="danger" pill>
                Admin tool
              </Badge>
            </div>
            <br></br>
            <ProjectTable tableType="admin" title={'Manage Projects'} {...props} />
            <br></br>
          </Col>
          <Col xs="12" sm="12" md="2"></Col>
        </Row>
      </Col>
    </Row>
  )
}

export default Projects
