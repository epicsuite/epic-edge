import React, { useState, useEffect } from 'react'
import { TextInput } from 'src/edge/project/forms/TextInput'
import { FileInput } from 'src/edge/project/forms/FileInput'
import { components } from '../defaults'

export const Dataset = (props) => {
  const componentName = 'dataset'
  const [form, setState] = useState({ ...components[componentName] })
  const [doValidation, setDoValidation] = useState(0)

  const setTextInput = (inForm, name) => {
    if (inForm.validForm) {
      form[name] = inForm.textInput
    } else {
      form[name] = ''
    }
    setDoValidation(doValidation + 1)
  }

  const setFileInput = (inForm, name) => {
    if (inForm.validForm) {
      form[name] = inForm.fileInput
      form['display'] = inForm.fileInput_display
    } else {
      form[name] = null
    }
    setDoValidation(doValidation + 1)
  }

  //trigger validation method when input changes
  useEffect(() => {
    // check input errors
    let errors = ''
    if (!props.name.isOptional && !form.name) {
      errors += props.name.text + ' error<br/>'
    }
    if (!props.data.isOptional && !form.data) {
      errors += props.data.text + ' error<br/>'
    }
    if (errors === '') {
      form.errMessage = null
      form.validForm = true
    } else {
      form.errMessage = errors
      form.validForm = false
    }
    //force updating parent's inputParams
    props.setParams(form, props.id)
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <TextInput
        name={'name'}
        setParams={setTextInput}
        text={props.name.text}
        tooltip={props.name.tooltip}
        defaultValue={props.name.defaultValue}
        isOptional={props.name.isOptional}
        placeholder={props.name.placeholder}
        errMessage={props.name.errMessage}
        isValidTextInput={props.isValidTextInput}
      />
      <br></br>
      <FileInput
        name={'data'}
        setParams={setFileInput}
        isValidFileInput={props.isValidFileInput}
        text={props.data.text}
        tooltip={props.data.tooltip}
        enableInput={props.data.enableInput}
        placeholder={props.data.placeholder}
        dataSources={props.data.dataSources}
        fileTypes={props.data.fileTypes}
        viewFile={props.data.viewFile}
        isOptional={props.data.isOptional}
        cleanupInput={props.data.cleanupInput}
      />
      <br></br>
    </>
  )
}
