import React, { useState, useEffect } from 'react'
import { Button, Form, Row, Col } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { postData, getData, notify, apis } from 'src/edge/common/util'
import { LoaderDialog, MessageDialog } from 'src/edge/common/Dialogs'
import { Project } from 'src/edge/project/forms/Project'
import { HtmlText } from 'src/edge/common/HtmlText'
import { workflowList } from 'src/util'
import { SideMenu } from 'src/components/SideMenu'
import { WorkflowInput } from './forms/WorkflowInput'
import { UploadData } from './forms/UploadData'
import { workflowOptions, mainComponents } from './defaults'

const Main = (props) => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [requestSubmit, setRequestSubmit] = useState(false)
  const [projectParams, setProjectParams] = useState()
  const [inputComponents, setInputComponents] = useState({})
  const [doValidation, setDoValidation] = useState(0)
  const [workflow] = useState(workflowOptions[0].value)
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
    setInputComponents({ ...inputComponents, [name]: params })
    setDoValidation(doValidation + 1)
  }

  //submit button clicked
  const onSubmit = () => {
    setSubmitting(true)
    let formData = new FormData()
    formData.append('category', workflowList[workflow].category)
    // set project info
    formData.append(
      'project',
      JSON.stringify({
        name: projectParams.projectName,
        desc: projectParams.projectDesc,
        type: workflow,
      }),
    )

    // set workflow inputs
    let myWorkflow = { name: workflow, input: {} }
    // set workflow input display
    let inputDisplay = { workflow: workflowList[workflow].label, input: {} }

    mainComponents.forEach((component) => {
      if (!inputComponents[component]) {
        return
      }
      myWorkflow.input[component] = {}
      inputDisplay.input[inputComponents[component].text] = {}
      Object.keys(inputComponents[component].inputs).forEach((key) => {
        if (key === 'csvFile') {
          formData.append('file', inputComponents[component].inputs[key].value)
          myWorkflow.input[component][key] = inputComponents[component].inputs[key].value.name
          inputDisplay.input[inputComponents[component].text][
            inputComponents[component].inputs[key].text
          ] = inputComponents[component].inputs[key].value.name
        } else {
          myWorkflow.input[component][key] = inputComponents[component].inputs[key].value
          if (inputComponents[component].inputs[key].display) {
            inputDisplay.input[inputComponents[component].text][
              inputComponents[component].inputs[key].text
            ] = inputComponents[component].inputs[key].display
          } else {
            inputDisplay.input[inputComponents[component].text][
              inputComponents[component].inputs[key].text
            ] = inputComponents[component].inputs[key].value
          }
        }
      })
    })
    // set form data
    formData.append('workflow', JSON.stringify(myWorkflow))
    formData.append('inputDisplay', JSON.stringify(inputDisplay))

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

    Object.keys(inputComponents).forEach((component) => {
      if (!inputComponents[component].validForm) {
        setRequestSubmit(false)
      }
    })
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
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
                  <h4 className="pt-3">Fastq to HiC</h4>
                  {workflow && workflowList[workflow].info && (
                    <span className="pt-3 text-muted edge-text-size-small">
                      <HtmlText
                        text={
                          workflowList[workflow].info +
                          ' <a target="_blank" href=' +
                          workflowList[workflow].link +
                          ' rel="noopener noreferrer">Learn more</a>'
                        }
                      />
                      <br></br>
                    </span>
                  )}
                  <hr />
                  <Project setParams={setProject} />
                  <br></br>
                  {workflow === 'fq2hic' && (
                    <>
                      <UploadData
                        title={'Upload Files'}
                        info={
                          'Upload fastq files required by the experimental design. You can skip this step if the fastq files have already been uploaded. Use the "My Uploads" table below to manage your uploads.'
                        }
                        isValid={true}
                        extensions={['fq', 'fastq']}
                      />
                      <WorkflowInput
                        title={
                          inputComponents['workflowInput']
                            ? inputComponents['workflowInput'].text
                            : 'Project Settings'
                        }
                        setParams={setComponentParams}
                        isValid={
                          inputComponents['workflowInput']
                            ? inputComponents['workflowInput'].validForm
                            : false
                        }
                        errMessage={
                          inputComponents['workflowInput']
                            ? inputComponents['workflowInput'].errMessage
                            : null
                        }
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
