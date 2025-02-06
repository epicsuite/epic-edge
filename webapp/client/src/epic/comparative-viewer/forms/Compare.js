import React, { useState, useEffect } from 'react'
import { Card, CardBody, Collapse } from 'reactstrap'
import { Header } from 'src/edge/project/forms/SectionHeader'
import { HtmlText } from 'src/edge/common/HtmlText'
import { FileInput } from 'src/edge/project/forms/FileInput'
import { isValidFileInput } from 'src/edge/common/util'
import { components } from '../defaults'

export const Compare = (props) => {
  const componentName = 'compare'
  const [collapseParms, setCollapseParms] = useState(false)
  const [form] = useState({ ...components[componentName] })
  const [validInputs] = useState({ ...components[componentName].validInputs })
  const [doValidation, setDoValidation] = useState(0)

  const toggleParms = () => {
    setCollapseParms(!collapseParms)
  }

  const setFileInput = (inForm, name) => {
    if (inForm.validForm) {
      form.inputs[name].value = inForm.fileInput
      form.inputs[name].display = inForm.fileInput_display
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
            <FileInput
              name={'leftVtpFile'}
              setParams={setFileInput}
              isValidFileInput={isValidFileInput}
              text={components[componentName].inputs['leftVtpFile'].text}
              tooltip={components[componentName].inputs['leftVtpFile']['fileInput'].tooltip}
              enableInput={components[componentName].inputs['leftVtpFile']['fileInput'].enableInput}
              placeholder={components[componentName].inputs['leftVtpFile']['fileInput'].placeholder}
              dataSources={
                props.userType && props.userType === 'user'
                  ? components[componentName].inputs['leftVtpFile']['fileInput'].dataSources
                  : 'public'
              }
              fileTypes={components[componentName].inputs['leftVtpFile']['fileInput'].fileTypes}
              viewFile={components[componentName].inputs['leftVtpFile']['fileInput'].viewFile}
              isOptional={components[componentName].inputs['leftVtpFile']['fileInput'].isOptional}
              cleanupInput={
                components[componentName].inputs['leftVtpFile']['fileInput'].cleanupInput
              }
            />
            <br></br>
            <FileInput
              name={'rightVtpFile'}
              setParams={setFileInput}
              isValidFileInput={isValidFileInput}
              text={components[componentName].inputs['rightVtpFile'].text}
              tooltip={components[componentName].inputs['rightVtpFile']['fileInput'].tooltip}
              enableInput={
                components[componentName].inputs['rightVtpFile']['fileInput'].enableInput
              }
              placeholder={
                components[componentName].inputs['rightVtpFile']['fileInput'].placeholder
              }
              dataSources={
                props.userType && props.userType === 'user'
                  ? components[componentName].inputs['rightVtpFile']['fileInput'].dataSources
                  : 'public'
              }
              fileTypes={components[componentName].inputs['rightVtpFile']['fileInput'].fileTypes}
              viewFile={components[componentName].inputs['rightVtpFile']['fileInput'].viewFile}
              isOptional={components[componentName].inputs['rightVtpFile']['fileInput'].isOptional}
              cleanupInput={
                components[componentName].inputs['rightVtpFile']['fileInput'].cleanupInput
              }
            />
            <br></br>
          </CardBody>
        </Collapse>
      </Card>
    </>
  )
}
