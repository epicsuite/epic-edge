import React, { useState, useEffect } from 'react'
import { Card, CardBody, Collapse } from 'reactstrap'
import { Header } from 'src/edge/project/forms/SectionHeader'
import { HtmlText } from 'src/edge/common/HtmlText'
import { FolderInput } from 'src/edge/project/forms/FolderInput'
import { components } from '../defaults'

export const Episcope = (props) => {
  const componentName = 'episcope'
  const [collapseParms, setCollapseParms] = useState(false)
  const [form] = useState({ ...components[componentName] })
  const [validInputs] = useState({ ...components[componentName].validInputs })
  const [doValidation, setDoValidation] = useState(0)
  const toggleParms = () => {
    setCollapseParms(!collapseParms)
  }

  const setFolderInput = (inForm, name) => {
    if (inForm.validForm) {
      form.inputs[name].value = inForm.folderInput
      form.inputs[name].display = inForm.folderInput_display
      if (validInputs[name]) {
        validInputs[name].isValid = true
      }
    } else {
      form.inputs[name].value = null
      form.inputs[name].display = null
      if (validInputs[name]) {
        validInputs[name].isValid = false
      }
    }
    setDoValidation(doValidation + 1)
  }

  //trigger validation method when input changes
  useEffect(() => {
    // check input errors
    let errors = ''
    Object.keys(validInputs).forEach((key) => {
      if (!validInputs[key].isValid) {
        errors += validInputs[key].error + '<br/>'
      }
    })

    if (errors === '') {
      form.errMessage = null
      form.validForm = true
    } else {
      form.errMessage = errors
      form.validForm = false
    }
    //force updating parent's inputParams
    props.setParams(form, componentName)
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <span className="pt-3 text-muted edge-text-size-small">
        <HtmlText text={components[componentName].info} />
        <br></br>
      </span>
      <br></br>
      <Card className="workflow-card">
        <Header
          toggle={true}
          toggleParms={toggleParms}
          title={props.title}
          collapseParms={collapseParms}
          id={componentName + 'input'}
          isValid={props.isValid}
          errMessage={props.errMessage ? props.errMessage : form.errMessage}
        />
        <Collapse isOpen={!collapseParms} id={'collapseParameters-' + props.name}>
          <CardBody>
            <FolderInput
              name={'dataPath'}
              setParams={setFolderInput}
              text={components[componentName].inputs['dataPath'].text}
              tooltip={components[componentName].inputs['dataPath']['folderInput'].tooltip}
              enableInput={components[componentName].inputs['dataPath']['folderInput'].enableInput}
              placeholder={components[componentName].inputs['dataPath']['folderInput'].placeholder}
              dataSources={
                props.userType && props.userType === 'user'
                  ? components[componentName].inputs['dataPath']['folderInput'].dataSources
                  : 'public'
              }
              projectTypes={
                components[componentName].inputs['dataPath']['folderInput'].projectTypes
              }
              fileTypes={components[componentName].inputs['dataPath']['folderInput'].fileTypes}
              viewFile={components[componentName].inputs['dataPath']['folderInput'].viewFile}
              isOptional={components[componentName].inputs['dataPath']['folderInput'].isOptional}
              cleanupInput={
                components[componentName].inputs['dataPath']['folderInput'].cleanupInput
              }
            />
            <br></br>
          </CardBody>
        </Collapse>
      </Card>
    </>
  )
}
