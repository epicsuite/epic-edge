import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Row, Col } from 'reactstrap'
import ProjectSummary from '../ProjectSummary'
import ProjectResult from '../../ProjectResult'
import { LoaderDialog } from '../../../common/Dialogs'
import { getData, apis } from '../../../common/util'
import { SubTopBar } from 'src/edge/common/SubTopBar'

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
        <Col xs="12" sm="12" md="10">
          {process.env.REACT_APP_SUBTOPBAR === 'on' && (
            <>
              <SubTopBar active={'uploads'} />
              <br></br>
              <br></br>
            </>
          )}
          <LoaderDialog loading={loading} text="Loading..." />
          {error ? (
            <div className="clearfix">
              <h4 className="pt-3">Project not found</h4>
              <hr />
              <p className="text-muted float-left">
                The project might be deleted or you have no permission to acces it.
              </p>
            </div>
          ) : (
            <>
              <ProjectSummary project={project} />
              <br></br>
              <ProjectResult project={project} type={'public'} />
            </>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default Public
