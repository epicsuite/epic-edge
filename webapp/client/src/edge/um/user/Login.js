import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button, Card, CardBody, CardGroup, Col, Container, Row } from 'reactstrap'

import { login } from '../../../redux/reducers/edge/userSlice'
import LoginForm from './forms/LoginForm'
import ORCIDLogin from './forms/ORCIDLogin'

const Login = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const loginErrors = useSelector((state) => state.message.errors)
  const messages = useSelector((state) => state.message.messages)

  useEffect(() => {
    if (user.isAuthenticated) {
      if (location.state) {
        navigate(location.state.from)
      } else {
        navigate('/home')
      }
    }
  }, [user, props, navigate, location])

  const handleValidSubmit = (data) => {
    const userData = { ...data }
    dispatch(login(userData))
  }

  return (
    <div className="app-body flex-row align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md="6">
            <CardGroup>
              <Card className="p-4 um-card">
                <CardBody>
                  <LoginForm
                    messages={messages}
                    errors={loginErrors}
                    onSubmit={handleValidSubmit}
                  />
                  <Row className="justify-content-center">
                    {process.env.REACT_APP_EMAIL_NOTIFICATION &&
                      process.env.REACT_APP_EMAIL_NOTIFICATION.toLowerCase() === 'on' && (
                        <>
                          <Col xs="12">
                            <Link to="/activate">
                              <Button color="link" className="px-0">
                                Account not active?
                              </Button>
                            </Link>
                          </Col>
                          <Col xs="12">
                            <Link to="/resetPassword">
                              <Button color="link" className="px-0">
                                Forgot your password?
                              </Button>
                            </Link>
                          </Col>
                        </>
                      )}
                    <Col xs="12">
                      <Link to="/register">
                        <Button color="link" className="px-0">
                          No account? Create one
                        </Button>
                      </Link>
                    </Col>
                    {process.env.REACT_APP_ORCID_AUTH === 'on' && (
                      <>
                        <Col xs="12">
                          <hr></hr>
                          <ORCIDLogin />
                        </Col>
                      </>
                    )}
                  </Row>
                </CardBody>
              </Card>
            </CardGroup>
            {process.env.REACT_APP_DISTRIBUTION_NOTE && (
              <span className="pt-3 text-muted edge-text-size-small">
                {process.env.REACT_APP_DISTRIBUTION_NOTE}
              </span>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login
