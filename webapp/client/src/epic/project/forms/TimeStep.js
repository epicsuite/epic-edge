import React, { useState, useEffect } from 'react'
import { TextInput } from 'src/edge/project/forms/TextInput'
import { FolderInput } from 'src/edge/project/forms/FolderInput'
import { components } from './defaults'

export const TimeStep = (props) => {
  const componentName = 'timeStep'
  const [form, setState] = useState({ ...components[componentName] })
  const [validInputs] = useState({ ...components[componentName].validInputs })
  const [doValidation, setDoValidation] = useState(0)

  const setTextInput = (inForm, name) => {
    form.inputs[name].value = inForm.textInput
    form.inputs[name].display = inForm.textInput
    if (validInputs[name]) {
      validInputs[name].isValid = inForm.validForm
    }
    setDoValidation(doValidation + 1)
  }

  const setFolderInput = (inForm, name) => {
    form.inputs[name].value = inForm.folderInput
    form.inputs[name].display = inForm.folderInput_display
    if (validInputs[name]) {
      validInputs[name].isValid = inForm.validForm
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
    props.setParams(form, props.index)
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <TextInput
        name={'name'}
        setParams={setTextInput}
        text={components[componentName].inputs['name'].text}
        tooltip={components[componentName].inputs['name']['textInput'].tooltip}
        defaultValue={components[componentName].inputs['name']['textInput'].defaultValue}
        isOptional={components[componentName].inputs['name']['textInput'].isOptional}
        placeholder={components[componentName].inputs['name']['textInput'].placeholder}
        errMessage={components[componentName].inputs['name']['textInput'].errMessage}
      />
      <br></br>
      <FolderInput
        name={'structure'}
        setParams={setFolderInput}
        text={components[componentName].inputs['structure'].text}
        tooltip={components[componentName].inputs['structure']['folderInput'].tooltip}
        enableInput={components[componentName].inputs['structure']['folderInput'].enableInput}
        placeholder={components[componentName].inputs['structure']['folderInput'].placeholder}
        dataSources={components[componentName].inputs['structure']['folderInput'].dataSources}
        fileTypes={components[componentName].inputs['structure']['folderInput'].fileTypes}
        viewFile={components[componentName].inputs['structure']['folderInput'].viewFile}
        isOptional={components[componentName].inputs['structure']['folderInput'].isOptional}
        cleanupInput={components[componentName].inputs['structure']['folderInput'].cleanupInput}
      />
      <br></br>
    </>
  )
}
