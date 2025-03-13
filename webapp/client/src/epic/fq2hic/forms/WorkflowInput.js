import React, { useState, useEffect } from 'react'
import { Card, CardBody, Collapse } from 'reactstrap'
import { Header } from 'src/edge/project/forms/SectionHeader'
import { HtmlText } from 'src/edge/common/HtmlText'
import { TextInput } from 'src/edge/project/forms/TextInput'
import { IntegerInput } from 'src/edge/project/forms/IntegerInput'
import { FileUpload } from 'src/edge/project/forms/FileUpload'
import { isValidTextInput } from '../../util'
import { components } from '../defaults'

export const WorkflowInput = (props) => {
  const componentName = 'workflowInput'
  const [collapseParms, setCollapseParms] = useState(false)
  const [form, setState] = useState({ ...components[componentName] })
  const [validInputs, setValidInputs] = useState({ ...components[componentName].validInputs })
  const [doValidation, setDoValidation] = useState(0)

  const toggleParms = () => {
    setCollapseParms(!collapseParms)
  }

  //callback function for child component
  const setFileUpload = (inForm, name) => {
    if (inForm.validForm) {
      form.inputs[name].value = inForm.file
      if (validInputs[name]) {
        validInputs[name].isValid = true
      }
    } else {
      form.inputs[name].value = null
      if (validInputs[name]) {
        validInputs[name].isValid = false
      }
    }
    setDoValidation(doValidation + 1)
  }

  const setIntegerInput = (inForm, name) => {
    if (inForm.validForm) {
      form.inputs[name].value = inForm.integerInput
      if (validInputs[name]) {
        validInputs[name].isValid = true
      }
    } else {
      form.inputs[name].value = null
      if (validInputs[name]) {
        validInputs[name].isValid = false
      }
    }
    setDoValidation(doValidation + 1)
  }

  const setTextInput = (inForm, name) => {
    if (inForm.validForm) {
      form.inputs[name].value = inForm.textInput
      if (validInputs[name]) {
        validInputs[name].isValid = true
      }
    } else {
      form.inputs[name].value = ''
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
          <FileUpload
            name={'csvFile'}
            setParams={setFileUpload}
            text={components[componentName].inputs['csvFile'].text}
            tooltip={components[componentName].inputs['csvFile']['fileInput'].tooltip}
            accept={components[componentName].inputs['csvFile']['fileInput'].extensions}
          />
          <br></br>
          <span className="pt-3 text-muted edge-text-size-small">
            Define high level attributes of the workflow
          </span>
          <TextInput
            name={'cellLine'}
            setParams={setTextInput}
            text={components[componentName].inputs['cellLine'].text}
            tooltip={components[componentName].inputs['cellLine']['textInput'].tooltip}
            defaultValue={components[componentName].inputs['cellLine']['textInput'].defaultValue}
            isOptional={components[componentName].inputs['cellLine']['textInput'].isOptional}
            placeholder={components[componentName].inputs['cellLine']['textInput'].placeholder}
            errMessage={components[componentName].inputs['cellLine']['textInput'].errMessage}
            isValidTextInput={isValidTextInput}
          />
          <br></br>
          <TextInput
            name={'description'}
            setParams={setTextInput}
            text={components[componentName].inputs['description'].text}
            tooltip={components[componentName].inputs['description']['textInput'].tooltip}
            defaultValue={components[componentName].inputs['description']['textInput'].defaultValue}
            isOptional={components[componentName].inputs['description']['textInput'].isOptional}
            placeholder={components[componentName].inputs['description']['textInput'].placeholder}
            errMessage={components[componentName].inputs['description']['textInput'].errMessage}
            isValidTextInput={isValidTextInput}
          />
          <br></br>
          <TextInput
            name={'experiment'}
            setParams={setTextInput}
            text={components[componentName].inputs['experiment'].text}
            tooltip={components[componentName].inputs['experiment']['textInput'].tooltip}
            defaultValue={components[componentName].inputs['experiment']['textInput'].defaultValue}
            isOptional={components[componentName].inputs['experiment']['textInput'].isOptional}
            placeholder={components[componentName].inputs['experiment']['textInput'].placeholder}
            errMessage={components[componentName].inputs['experiment']['textInput'].errMessage}
            isValidTextInput={isValidTextInput}
          />
          <br></br>
          <IntegerInput
            name={'replicate'}
            id={'replicate'}
            setParams={setIntegerInput}
            text={components[componentName].inputs['replicate'].text}
            tooltip={components[componentName].inputs['replicate']['integerInput'].tooltip}
            defaultValue={
              components[componentName].inputs['replicate']['integerInput'].defaultValue
            }
            min={components[componentName].inputs['replicate']['integerInput'].min}
            max={components[componentName].inputs['replicate']['integerInput'].max}
          />
          <br></br>
          <IntegerInput
            name={'resolution'}
            id={'resolution'}
            setParams={setIntegerInput}
            text={components[componentName].inputs['resolution'].text}
            tooltip={components[componentName].inputs['resolution']['integerInput'].tooltip}
            defaultValue={
              components[componentName].inputs['resolution']['integerInput'].defaultValue
            }
            min={components[componentName].inputs['resolution']['integerInput'].min}
            max={components[componentName].inputs['resolution']['integerInput'].max}
          />
          <br></br>
          <TextInput
            name={'timeUnits'}
            setParams={setTextInput}
            text={components[componentName].inputs['timeUnits'].text}
            tooltip={components[componentName].inputs['timeUnits']['textInput'].tooltip}
            defaultValue={components[componentName].inputs['timeUnits']['textInput'].defaultValue}
            isOptional={components[componentName].inputs['timeUnits']['textInput'].isOptional}
            placeholder={components[componentName].inputs['timeUnits']['textInput'].placeholder}
            errMessage={components[componentName].inputs['timeUnits']['textInput'].errMessage}
            isValidTextInput={isValidTextInput}
          />
          <br></br>
          <TextInput
            name={'timeValues'}
            setParams={setTextInput}
            text={components[componentName].inputs['timeValues'].text}
            tooltip={components[componentName].inputs['timeValues']['textInput'].tooltip}
            defaultValue={components[componentName].inputs['timeValues']['textInput'].defaultValue}
            isOptional={components[componentName].inputs['timeValues']['textInput'].isOptional}
            placeholder={components[componentName].inputs['timeValues']['textInput'].placeholder}
            errMessage={components[componentName].inputs['timeValues']['textInput'].errMessage}
            isValidTextInput={isValidTextInput}
          />
          <br></br>
          <TextInput
            name={'treatments'}
            setParams={setTextInput}
            text={components[componentName].inputs['treatments'].text}
            tooltip={components[componentName].inputs['treatments']['textInput'].tooltip}
            defaultValue={components[componentName].inputs['treatments']['textInput'].defaultValue}
            isOptional={components[componentName].inputs['treatments']['textInput'].isOptional}
            placeholder={components[componentName].inputs['treatments']['textInput'].placeholder}
            errMessage={components[componentName].inputs['treatments']['textInput'].errMessage}
            isValidTextInput={isValidTextInput}
          />
          <br></br>
        </CardBody>
      </Collapse>
    </Card>
  )
}
