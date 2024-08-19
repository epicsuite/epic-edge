import React, { useState, useEffect } from 'react'
import { Button, Form, Row, Col } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { postData, getData, notify, apis } from 'src/edge/common/util'
import { LoaderDialog, MessageDialog } from 'src/edge/common/Dialogs'
import MySelect from 'src/edge/common/MySelect'
import { Project } from 'src/edge/project/forms/Project'
import { HtmlText } from 'src/edge/project/forms/HtmlText'
import { workflowList } from 'src/edge/common/util'
import { SideMenu } from 'src/components/SideMenu'
import { HiC } from './forms/HiC'
import { PeaksATAC } from './forms/PeaksATAC'
import { PeaksCHIP } from './forms/PeaksCHIP'
import { slurpy, workflowOptions, components } from './defaults'

const Main = (props) => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [requestSubmit, setRequestSubmit] = useState(false)
  const [projectParams, setProjectParams] = useState()
  const [workflowComponent, setWorkflowComponent] = useState({})
  const [doValidation, setDoValidation] = useState(0)
  const [workflow, setWorkflow] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [sysMsg, setSysMsg] = useState()

  //callback function for child component
  const setProject = (params) => {
    //console.log('main project:', params)
    setProjectParams(params)
    setDoValidation(doValidation + 1)
  }
  const setComponentParams = (params, name) => {
    //console.log('component:', params, name)
    setWorkflowComponent(params)
    setDoValidation(doValidation + 1)
  }

  //submit button clicked
  const onSubmit = () => {
    setSubmitting(true)
    let formData = {}
    formData.category = workflowList[workflow].category
    // set project info
    formData.project = {
      name: projectParams.projectName,
      desc: projectParams.projectDesc,
      type: workflow,
    }

    // set workflow inputs
    let myWorkflow = { name: workflow, input: {} }
    // set workflow input display
    let inputDisplay = { workflow: workflowList[workflow].label, input: {} }

    myWorkflow.input = {}
    inputDisplay.input = {}
    Object.keys(workflowComponent.inputs).forEach((key) => {
      myWorkflow.input[key] = workflowComponent.inputs[key].value
      if (workflowComponent.inputs[key].display) {
        inputDisplay.input[workflowComponent.inputs[key].text] =
          workflowComponent.inputs[key].display
      } else {
        inputDisplay.input[workflowComponent.inputs[key].text] = workflowComponent.inputs[key].value
      }
    })
    // set form data
    formData.workflow = myWorkflow
    formData.inputDisplay = inputDisplay

    // submit to server via api
    postData(apis.userProjects, formData)
      .then((data) => {
        setSubmitting(false)
        notify('success', 'Your workflow request was submitted successfully!', 2000)
        setTimeout(() => navigate('/user/projects'), 2000)
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

    if (projectParams && !projectParams.validForm) {
      setRequestSubmit(false)
    }

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

  useEffect(() => {
    let url = apis.userInfo
    getData(url)
      .then((data) => {
        if (data.info.allowNewRuns) {
          setDisabled(false)
        } else {
          setSysMsg(data.info.message)
          setDisabled(true)
          setOpenDialog(true)
        }
      })
      .catch((err) => {
        alert(err)
      })
  }, [])

  return (
    <div
      className="animated fadeIn"
      style={disabled ? { pointerEvents: 'none', opacity: '0.4' } : {}}
    >
      <Row className="justify-content-center">
        <Col xs="12" sm="12" md="2">
          <SideMenu />
        </Col>
        <Col xs="12" sm="12" md="10">
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
              <LoaderDialog loading={submitting === true} text="Submitting..." />
              <Form
                onSubmit={(e) => {
                  e.preventDefault()
                }}
              >
                <div className="clearfix">
                  <h4 className="pt-3">Run Slurpy Workflow</h4>
                  <span className="pt-3 text-muted edge-text-size-small">
                    <HtmlText
                      text={
                        slurpy.info +
                        ' <a target="_blank" href=' +
                        slurpy.link +
                        ' rel="noopener noreferrer">Learn more</a>'
                      }
                    />
                  </span>
                  <br></br>
                  <hr />
                  <Project setParams={setProject} />
                  <br></br>
                  <b>Workflow</b>
                  <MySelect
                    //defaultValue={workflowOptions[0]}
                    options={workflowOptions}
                    onChange={(e) => {
                      if (e) {
                        setWorkflow(e.value)
                      } else {
                        setWorkflow()
                      }
                    }}
                    placeholder="Select a Workflow..."
                    isClearable={true}
                  />
                  {workflow === 'hic' && (
                    <>
                      <HiC
                        title={workflowComponent ? workflowComponent.text : 'Input'}
                        setParams={setComponentParams}
                        isValid={workflowComponent ? workflowComponent.validForm : false}
                        errMessage={workflowComponent ? workflowComponent.errMessage : null}
                      />
                    </>
                  )}
                  {workflow === 'peaksATAC' && (
                    <>
                      <PeaksATAC
                        title={workflowComponent ? workflowComponent.text : 'Input'}
                        setParams={setComponentParams}
                        isValid={workflowComponent ? workflowComponent.validForm : false}
                        errMessage={workflowComponent ? workflowComponent.errMessage : null}
                      />
                    </>
                  )}
                  {workflow === 'peaksCHIP' && (
                    <>
                      <PeaksCHIP
                        title={workflowComponent ? workflowComponent.text : 'Input'}
                        setParams={setComponentParams}
                        isValid={workflowComponent ? workflowComponent.validForm : false}
                        errMessage={workflowComponent ? workflowComponent.errMessage : null}
                      />
                    </>
                  )}
                  <br></br>
                </div>

                <div className="edge-center">
                  <Button
                    color="primary"
                    onClick={(e) => onSubmit()}
                    disabled={!workflow || !requestSubmit}
                  >
                    Submit
                  </Button>{' '}
                </div>
                <br></br>
                <br></br>
              </Form>
            </Col>
            <Col xs="12" sm="12" md="2"></Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

export default Main
