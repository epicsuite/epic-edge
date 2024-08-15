import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Row } from 'reactstrap'
import { MessageDialog } from '../../common/Dialogs'
import ActivateForm from './forms/ActivateForm'
import { activate, getActivationLink } from '../../../redux/reducers/edge/userSlice'

const Activate = (props) => {
  const navigate = useNavigate()
  let [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const activateErrors = useSelector((state) => state.message.errors)
  const messages = useSelector((state) => state.message.messages)

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
      const userData = {
        email: email,
        token: token,
      }
      dispatch(activate(userData))
    }
  }, [user, props, navigate, dispatch, searchParams])

  const closeMsgModal = () => {
    navigate('/login')
  }

  const onSubmit = (data) => {
    const userData = { ...data, actionURL: process.env.REACT_APP_ACTIVATE_ACTION_URL }
    dispatch(getActivationLink(userData))
  }

  return (
    <div className="app-body flex-row align-items-center">
      {messages.activate ? (
        <MessageDialog
          isOpen={messages.activate ? true : false}
          message={messages.activate}
          handleClickClose={closeMsgModal}
        />
      ) : (
        <Row className="justify-content-center um-form">
          <Col md="4">
            <ActivateForm onSubmit={onSubmit} messages={messages} errors={activateErrors} />
          </Col>
        </Row>
      )}
    </div>
  )
}

export default Activate
