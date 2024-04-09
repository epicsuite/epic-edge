import React from 'react'
import { Button, Row, Col } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import ProjectTable from '../common/ProjectTable'
import { SubTopBar } from 'src/edge/common/SubTopBar'

const Projects = (props) => {
  const navigate = useNavigate()
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
          <div className="edge-right">
            <Button
              color="primary"
              size="sm"
              className="rounded-pill"
              onClick={() => navigate('/user/allProjects')}
              outline
            >
              &nbsp;Show all projects available to me&nbsp;
            </Button>
          </div>
          <br></br>
          <ProjectTable tableType="user" title={'My Projects'} {...props} />
          <br></br>
        </Col>
      </Row>
    </div>
  )
}

export default Projects
