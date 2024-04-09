import React from 'react'
import { Row, Col } from 'reactstrap'
import ProjectTableViewOnly from '../common/ProjectTableViewOnly'
import { apis } from '../../common/util'
import { SubTopBar } from 'src/edge/common/SubTopBar'

const AllProjects = (props) => {
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
            title={'All Projects Available to Me'}
            projectPageUrl={'/user/project?code='}
            api={apis.userAllProjects}
          />
          <br></br>
        </Col>
      </Row>
    </div>
  )
}

export default AllProjects
