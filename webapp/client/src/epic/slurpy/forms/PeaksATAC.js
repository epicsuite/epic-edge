import React, { useState, useEffect } from 'react'
import { Card, CardBody, Col, Row, Collapse } from 'reactstrap'
import { Header } from 'src/edge/project/forms/SectionHeader'
import { HtmlText } from 'src/edge/project/forms/HtmlText'
import { FileInput } from 'src/edge/project/forms/FileInput'
import { isValidFileInput } from 'src/edge/common/util'
import { components } from '../defaults'

export const PeaksATAC = (props) => {
  const componentName = 'peaksATAC'
  const [collapseParms, setCollapseParms] = useState(false)
  const [form, setState] = useState({ ...components[componentName] })
  const [validInputs, setValidInputs] = useState({ ...components[componentName].validInputs })
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
        <HtmlText
          text={
            components[componentName].info +
            ' <a target="_blank" href=' +
            components[componentName].link +
            ' rel="noopener noreferrer">Learn more</a>'
          }
        />
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
              name={'referenceFile'}
              setParams={setFileInput}
              isValidFileInput={isValidFileInput}
              text={components[componentName].inputs['referenceFile'].text}
              tooltip={components[componentName].inputs['referenceFile']['fileInput'].tooltip}
              enableInput={
                components[componentName].inputs['referenceFile']['fileInput'].enableInput
              }
              placeholder={
                components[componentName].inputs['referenceFile']['fileInput'].placeholder
              }
              dataSources={
                components[componentName].inputs['referenceFile']['fileInput'].dataSources
              }
              fileTypes={components[componentName].inputs['referenceFile']['fileInput'].fileTypes}
              viewFile={components[componentName].inputs['referenceFile']['fileInput'].viewFile}
              isOptional={components[componentName].inputs['referenceFile']['fileInput'].isOptional}
              cleanupInput={
                components[componentName].inputs['referenceFile']['fileInput'].cleanupInput
              }
            />
            <br></br>
          </CardBody>
        </Collapse>
      </Card>
    </>
  )
}
