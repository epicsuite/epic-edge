import React, { useState, useEffect } from 'react'
import { Button, Form, Row, Col } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useSelector } from 'react-redux'
import { LoaderDialog, MessageDialog } from 'src/edge/common/Dialogs'
import { Compare } from './forms/Compare'
import { HtmlText } from 'src/edge/common/HtmlText'
import { compare, components } from './defaults'
import { submitTrameSession } from '../util'

const Main = (props) => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.user)
  const [submitting, setSubmitting] = useState(false)
  const [requestSubmit, setRequestSubmit] = useState(false)
  const [workflowComponent, setWorkflowComponent] = useState({})
  const [doValidation, setDoValidation] = useState(0)
  const [workflow, setWorkflow] = useState('compare')
  const [openDialog, setOpenDialog] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [sysMsg, setSysMsg] = useState()

  const setComponentParams = (params, name) => {
    //console.log('component:', params, name)
    setWorkflowComponent(params)
    setDoValidation(doValidation + 1)
  }

  //submit button clicked
  const onSubmit = () => {
    setSubmitting(true)

    // set inputs
    let input = {}
    Object.keys(workflowComponent.inputs).forEach((key) => {
      input[key] = workflowComponent.inputs[key].value
    })
    console.log(input)

    // call api to launch a trame instance and redirect to trame
    let params = { input: input, app: 'compare' }
    setSubmitting(true)
    submitTrameSession(params, user.isAuthenticated ? 'user' : 'public')
      .then((data) => {
        setSubmitting(false)
        navigate('/trame', { state: { url: data.url } })
      })
      .catch((error) => {
        setSubmitting(false)
        alert(error)
      })
  }

  const closeMsgModal = () => {
    setOpenDialog(false)
  }

  useEffect(() => {
    setRequestSubmit(true)

    if (!workflowComponent.validForm) {
      setRequestSubmit(false)
    }
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (workflow) {
      setWorkflowComponent(components[workflow])
    } else {
      setWorkflowComponent({})
    }
    setDoValidation(doValidation + 1)
  }, [workflow]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="animated fadeIn">
      <Row className="justify-content-center">
        <Col xs="12" sm="12" md="10">
          <MessageDialog
            className="modal-lg modal-danger"
            title="System Message"
            isOpen={openDialog}
            html={true}
            message={'<div><b>' + sysMsg + '</b></div>'}
            handleClickClose={closeMsgModal}
          />
          <ToastContainer />
          <LoaderDialog loading={submitting === true} text="Loading...   Please wait" />
          <Form
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <div className="clearfix">
              <h4 className="pt-3">Comparative Viewer</h4>
              <span className="pt-3 text-muted edge-text-size-small">
                <HtmlText
                  text={
                    compare.info +
                    ' <a target="_blank" href=' +
                    compare.link +
                    ' rel="noopener noreferrer">Learn more</a>'
                  }
                />
              </span>
              <br></br>
              <hr />
              <Compare
                title={workflowComponent ? workflowComponent.text : 'Input'}
                setParams={setComponentParams}
                isValid={workflowComponent ? workflowComponent.validForm : false}
                errMessage={workflowComponent ? workflowComponent.errMessage : null}
                userType={user.isAuthenticated ? 'user' : 'public'}
              />
              <br></br>
            </div>

            <div className="edge-center">
              <Button
                color="primary"
                onClick={(e) => onSubmit()}
                disabled={!workflow || !requestSubmit || submitting}
              >
                Submit
              </Button>{' '}
            </div>
            <br></br>
            <br></br>
          </Form>
        </Col>
      </Row>
    </div>
  )
}

export default Main
