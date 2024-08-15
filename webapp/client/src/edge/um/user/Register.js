import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Col, Row } from 'reactstrap'

import { LoaderDialog, MessageDialog } from '../../common/Dialogs'
import { cleanMessage } from '../../../redux/reducers/messageSlice'
import { register } from '../../../redux/reducers/edge/userSlice'

import RegisterForm from './forms/RegisterForm'

const Register = (props) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const registerErrors = useSelector((state) => state.message.errors)
  const messages = useSelector((state) => state.message.messages)
  const page = useSelector((state) => state.page)

  useEffect(() => {
    // If logged in and user navigates to Login page, should redirect them to dashboard
    if (user.isAuthenticated) {
      navigate('/home')
    }
  }, [user, navigate])

  const handleValidSubmit = (data) => {
    let newUser = {
      ...data,
      active: true,
      message: process.env.REACT_APP_REGISTER_MSG,
    }
    if (process.env.REACT_APP_EMAIL_NOTIFICATION === 'on') {
      newUser = {
        ...data,
        active: false,
        actionURL: process.env.REACT_APP_ACTIVATE_ACTION_URL,
        message: process.env.REACT_APP_REGISTER_MSG_EMAIL,
      }
    }
    dispatch(register(newUser))
  }

  const closeMsgModal = () => {
    dispatch(cleanMessage())
    navigate('/login')
  }

  return (
    <div className="app-body flex-row align-items-center">
      <LoaderDialog loading={page.submittingForm} text="Verifying email..." />
      <Row className="justify-content-center um-form">
        <Col md="4">
          {registerErrors.register && (
            <p className="edge-form-input-error">{registerErrors.register}</p>
          )}
          <RegisterForm
            errors={registerErrors}
            loading={page.submitting_form}
            onSubmit={handleValidSubmit}
          />
          <MessageDialog
            isOpen={messages.register ? true : false}
            message={messages.register}
            handleClickClose={closeMsgModal}
          />
        </Col>
      </Row>
    </div>
  )
}

export default Register
