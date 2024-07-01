import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardBody, Col, Container, Row } from 'reactstrap'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MessageDialog } from '../../common/Dialogs'
import { cleanMessage } from '../../../redux/reducers/messageSlice'
import { resetPassword, getResetPasswordLink } from '../../../redux/reducers/edge/userSlice'
import ResetPasswordForm from './forms/ResetPasswordForm'
import ResetPasswordLinkForm from './forms/ResetPasswordLinkForm'

const ResetPassword = (props) => {
  const navigate = useNavigate()
  let [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const resetPasswordErrors = useSelector((state) => state.message.errors)
  const messages = useSelector((state) => state.message.messages)

  const [reset, setReset] = useState(false)
  const [email, setEmail] = useState()
  const [token, setToken] = useState()

  //componentDidMount()
  useEffect(() => {
    // If logged in and user navigates to this page, should redirect them to home page
    if (
      user.isAuthenticated ||
      (process.env.REACT_APP_EMAIL_NOTIFICATION &&
        process.env.REACT_APP_EMAIL_NOTIFICATION.toLowerCase() !== 'on')
    ) {
      navigate('/home')
    }

    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (email && token) {
      setEmail(email)
      setToken(token)
      setReset(true)
    }
  }, [props, user, navigate, searchParams])

  const onSubmit = (data) => {
    if (reset) {
      //reset password
      const userData = {
        email: email,
        token: token,
        newPassword: data.newpassword,
      }
      dispatch(resetPassword(userData))
    } else {
      const userData = { ...data, actionURL: process.env.REACT_APP_RESETPASSWORD_ACTION_URL }
      console.log(userData)
      dispatch(getResetPasswordLink(userData))
    }
  }

  const closeMsgModal = () => {
    navigate('/login')
    //clean up message
    dispatch(cleanMessage())
  }

  return (
    <div className="app-body flex-row align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md="6">
            <Card className="p-4 um-card">
              <CardBody>
                {reset ? (
                  <ResetPasswordForm
                    errors={resetPasswordErrors}
                    messages={messages}
                    onSubmit={onSubmit}
                  />
                ) : (
                  <ResetPasswordLinkForm
                    errors={resetPasswordErrors}
                    messages={messages}
                    onSubmit={onSubmit}
                  />
                )}
              </CardBody>
            </Card>
            <MessageDialog
              isOpen={messages.resetPassword ? true : false}
              message={messages.resetPassword}
              handleClickClose={closeMsgModal}
            />
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default ResetPassword
