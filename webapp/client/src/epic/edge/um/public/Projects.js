import React from 'react'
import { Row, Col } from 'reactstrap'
import ProjectTableViewOnly from 'src/edge/um/common/ProjectTableViewOnly'
import { apis } from 'src/edge/common/util'
import { SideMenu } from 'src/components/SideMenu'

const Projects = (props) => {
  return (
    <div className="animated fadeIn">
      <Row className="justify-content-center">
        <Col xs="12" sm="12" md="2">
          <SideMenu />
        </Col>
        <Col xs="12" sm="12" md="10">
          <Row className="justify-content-center">
            <Col xs="12" sm="12" md="10">
              <ProjectTableViewOnly
                title={'Public Projects'}
                projectPageUrl={'/public/project?code='}
                api={apis.publicProjects}
              />
              <br></br>
            </Col>
            <Col xs="12" sm="12" md="2"></Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

export default Projects
