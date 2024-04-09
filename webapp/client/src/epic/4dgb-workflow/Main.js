import React, { useState, useEffect } from 'react'
import { Button, Form, Row, Col } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { postData, getData, notify, apis } from 'src/edge/common/util'
import { LoaderDialog, MessageDialog } from 'src/edge/common/Dialogs'
import { SubTopBar } from 'src/edge/common/SubTopBar'
import { Project } from 'src/edge/project/forms/Project'
import { HtmlText } from 'src/edge/project/forms/HtmlText'
import { workflowList } from 'src/edge/common/util'
import { ProjectSettings } from './forms/ProjectSettings'
import { DataSets } from './forms/DataSets'
import { Tracks } from './forms/Tracks'
import { Annotations } from './forms/Annotations'
import { Bookmarks } from './forms/Bookmarks'
import { workflowOptions, mainComponents } from './defaults'

const Main = (props) => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [requestSubmit, setRequestSubmit] = useState(false)
  const [projectParams, setProjectParams] = useState()
  const [inputComponents, setInputComponents] = useState({})
  const [doValidation, setDoValidation] = useState(0)
  const [workflow, setWorkflow] = useState(workflowOptions[0].value)
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
    setInputComponents({ ...inputComponents, [name]: params })
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

    mainComponents.forEach((component) => {
      if (!inputComponents[component]) {
        return
      }
      myWorkflow.input[component] = {}
      inputDisplay.input[inputComponents[component].text] = {}
      Object.keys(inputComponents[component].inputs).forEach((key) => {
        if (Array.isArray(inputComponents[component].inputs[key])) {
          myWorkflow.input[component] = []
          inputDisplay.input[inputComponents[component].text] = []
          inputComponents[component].inputs[key].forEach((item, index) => {
            myWorkflow.input[component][index] = item.value
            inputDisplay.input[inputComponents[component].text][index] = item.display
          })
        } else if (component === 'tracks') {
          myWorkflow.input[component] = inputComponents[component].inputs[key].value
          if (inputComponents[component].inputs[key].display) {
            inputDisplay.input[inputComponents[component].text] =
              inputComponents[component].inputs[key].display
          } else {
            inputDisplay.input[inputComponents[component].text] =
              inputComponents[component].inputs[key].value
          }
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
        <Col xs="12" sm="12" md="10">
          <MessageDialog
            className="modal-lg modal-danger"
            title="System Message"
            isOpen={openDialog}
            html={true}
            message={'<div><b>' + sysMsg + '</b></div>'}
            handleClickClose={closeMsgModal}
          />
          <SubTopBar active={'workflow'} workflow={'4DGB Workflow'} to={'/workflow/4dgb'} />
          <ToastContainer />
          <LoaderDialog loading={submitting === true} text="Submitting..." />
          <Form
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <div className="clearfix">
              <h4 className="pt-3">Run 4DGB Workflow</h4>
              {workflow && (
                <span className="pt-3 text-muted edge-text-size-small">
                  <HtmlText
                    text={
                      workflowList[workflow].info +
                      ' <a target="_blank" href=' +
                      workflowList[workflow].link +
                      ' rel="noopener noreferrer">Learn more</a>'
                    }
                  />
                </span>
              )}
              <br></br>
              <hr />
              <Project setParams={setProject} />
              <br></br>
              {workflow === '4dgb' && (
                <>
                  <ProjectSettings
                    title={
                      inputComponents['projectSettings']
                        ? inputComponents['projectSettings'].text
                        : 'Project Settings'
                    }
                    setParams={setComponentParams}
                    isValid={
                      inputComponents['projectSettings']
                        ? inputComponents['projectSettings'].validForm
                        : false
                    }
                    errMessage={
                      inputComponents['projectSettings']
                        ? inputComponents['projectSettings'].errMessage
                        : null
                    }
                  />
                  <DataSets
                    setParams={setComponentParams}
                    title={
                      inputComponents['datasets'] ? inputComponents['datasets'].text : 'Datasets'
                    }
                    isValid={
                      inputComponents['datasets'] ? inputComponents['datasets'].validForm : false
                    }
                    errMessage={
                      inputComponents['datasets'] ? inputComponents['datasets'].errMessage : null
                    }
                  />
                  <Tracks
                    setParams={setComponentParams}
                    title={inputComponents['tracks'] ? inputComponents['tracks'].text : 'Tracks'}
                    isValid={inputComponents['tracks'] ? inputComponents['tracks'].validForm : true}
                    errMessage={
                      inputComponents['tracks'] ? inputComponents['tracks'].errMessage : null
                    }
                  />
                  <Annotations
                    setParams={setComponentParams}
                    title={
                      inputComponents['annotations']
                        ? inputComponents['annotations'].text
                        : 'Annotations'
                    }
                    isValid={
                      inputComponents['annotations']
                        ? inputComponents['annotations'].validForm
                        : true
                    }
                    errMessage={
                      inputComponents['annotations']
                        ? inputComponents['annotations'].errMessage
                        : null
                    }
                  />
                  <Bookmarks
                    setParams={setComponentParams}
                    title={
                      inputComponents['bookmarks'] ? inputComponents['bookmarks'].text : 'Bookmarks'
                    }
                    isValid={
                      inputComponents['bookmarks'] ? inputComponents['bookmarks'].validForm : true
                    }
                    errMessage={
                      inputComponents['bookmarks'] ? inputComponents['bookmarks'].errMessage : null
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
      </Row>
    </div>
  )
}

export default Main
