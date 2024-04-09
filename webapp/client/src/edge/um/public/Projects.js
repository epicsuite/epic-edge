import React from 'react'
import { Row, Col } from 'reactstrap'
import ProjectTableViewOnly from '../common/ProjectTableViewOnly'
import { apis } from '../../common/util'
import { SubTopBar } from 'src/edge/common/SubTopBar'

const Projects = (props) => {
  return (
    <div className="animated fadeIn">
      <Row className="justify-content-center">
        <Col xs="12" sm="12" md="10">
          {process.env.REACT_APP_SUBTOPBAR === 'on' && (
            <>
              <SubTopBar active={'uploads'} />
              <br></br>
              <br></br>
            </>
          )}
          <ProjectTableViewOnly
            title={'Public Projects'}
            projectPageUrl={'/public/project?code='}
            api={apis.publicProjects}
          />
          <br></br>
        </Col>
      </Row>
    </div>
  )
}

export default Projects
