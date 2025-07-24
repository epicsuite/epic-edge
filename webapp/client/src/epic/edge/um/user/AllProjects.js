import React from 'react'
import { Row, Col } from 'reactstrap'
import ProjectTableViewOnly from 'src/edge/um/common/ProjectTableViewOnly'
import { apis } from '/src/edge/common/util'
import { SideMenu } from 'src/components/SideMenu'

const AllProjects = (props) => {
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
                title={'All Projects Available to Me'}
                projectPageUrl={'/user/project?code='}
                api={apis.userAllProjects}
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

export default AllProjects
