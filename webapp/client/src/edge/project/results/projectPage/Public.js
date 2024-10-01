import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Row, Col } from 'reactstrap'
import ProjectSummary from '../ProjectSummary'
import ProjectResult from '../../ProjectResult'
import { LoaderDialog } from '../../../common/Dialogs'
import { getData, apis } from '../../../common/util'
import { SideMenu } from 'src/components/SideMenu'

const Public = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const [code, setCode] = useState()
  const [project, setProject] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()

  useEffect(() => {
    const codeParam = params.get('code')
    if (codeParam) {
      setCode(codeParam)
    } else {
      navigate('/public/projects')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const getProject = () => {
      let url = `${apis.publicProjects}/${code}`
      getData(url)
        .then((data) => {
          setProject(data.project)
          setLoading(false)
        })
        .catch((err) => {
          setError(err)
          setLoading(false)
        })
    }
    if (code) {
      setLoading(true)
      getProject()
    }
  }, [code])

  return (
    <div className="animated fadeIn">
      <Row className="justify-content-center">
        <Col xs="12" sm="12" md="2">
          <SideMenu />
        </Col>
        <Col xs="12" sm="12" md="10">
          <Row className="justify-content-center">
            <Col xs="12" sm="12" md="10">
              <LoaderDialog loading={loading} text="Loading..." />
              {error ? (
                <div className="clearfix">
                  <h4 className="pt-3">Project not found</h4>
                  <hr />
                  <p className="text-muted float-left">
                    The project might be deleted or you have no permission to access it.
                  </p>
                </div>
              ) : (
                <>
                  <ProjectSummary project={project} type={'public'} />
                  <br></br>
                  <ProjectResult project={project} type={'public'} />
                </>
              )}
            </Col>
            <Col xs="12" sm="12" md="2"></Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

export default Public
