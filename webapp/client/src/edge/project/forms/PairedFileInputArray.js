import React, { useState, useEffect } from 'react'
import { Button, Col, Row } from 'reactstrap'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import FileSelector from './FileSelector'
import { WarningTooltip } from '../../common/MyTooltip'
import { defaults } from '../../common/util'
import { components } from './defaults'

export const PairedFileInputArray = (props) => {
  const componentName = 'pairedFileInputArray'
  const [form, setState] = useState({ ...components[componentName] })
  const [doValidation, setDoValidation] = useState(0)
  const { control } = useForm({
    mode: defaults['form_mode'],
  })

  const {
    fields: pairedFileInputFields,
    append: pairedFileInputAppend,
    remove: pairedFileInputRemove,
  } = useFieldArray({
    control,
    name: 'pairedFileInput',
  })

  const handleFileSelection = (path, type, index, key) => {
    if ((props.isOptional && !key) || props.isValidFileInput(key, path)) {
      if (type === 'pairedFileInput1') {
        if (form.fileInput[index]) {
          form.fileInput[index].f1 = path
          form.fileInput_display[index].f1 = key
          form.fileInput_isValid[index].f1 = true
        } else {
          form.fileInput[index] = { f1: path }
          form.fileInput_display[index] = { f1: key }
          form.fileInput_isValid[index] = { f1: true }
        }
      } else if (type === 'pairedFileInput2') {
        if (form.fileInput[index]) {
          form.fileInput[index].f2 = path
          form.fileInput_display[index].f2 = key
          form.fileInput_isValid[index].f2 = true
        } else {
          form.fileInput[index] = { f2: path }
          form.fileInput_display[index] = { f2: key }
          form.fileInput_isValid[index] = { f2: true }
        }
      }
    } else {
      if (type === 'pairedFileInput1') {
        if (form.fileInput[index]) {
          form.fileInput[index].f1 = null
          form.fileInput_display[index].f1 = null
          form.fileInput_isValid[index].f1 = false
        } else {
          form.fileInput[index] = { f1: null }
          form.fileInput_display[index] = { f1: null }
          form.fileInput_isValid[index] = { f1: false }
        }
      } else if (type === 'pairedFileInput2') {
        if (form.fileInput[index]) {
          form.fileInput[index].f2 = null
          form.fileInput_display[index].f2 = null
          form.fileInput_isValid[index].f2 = false
        } else {
          form.fileInput[index] = { f2: null }
          form.fileInput_display[index] = { f2: null }
          form.fileInput_isValid[index] = { f2: false }
        }
      }
    }

    setDoValidation(doValidation + 1)
  }

  const validateInputs = () => {
    let valid = true
    if (!props.isOptional && form.fileInput.length === 0) {
      valid = false
    } else {
      form.fileInput_isValid.forEach((item) => {
        if (!item.f1 || !item.f2) {
          valid = false
        }
      })
    }
    return valid
  }

  //default 1 dataset
  useEffect(() => {
    pairedFileInputAppend({ name: 'pairedFileInput' })
    setState({
      ...form,
      fileInput: [],
      fileInput_display: [],
      fileInput_isValid: [],
    })
    setDoValidation(doValidation + 1)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  //trigger validation method when input changes
  useEffect(() => {
    //validate data inputs
    form.validForm = validateInputs()
    //force updating parent's inputParams
    props.setParams(form, props.name)
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Row>
        {(!props.maxInput || props.maxInput > 1) && (
          <Col md="3">
            {props.text}
            {!props.isOptional && pairedFileInputFields.length === 0 && (
              <WarningTooltip id={props.name} tooltip={'Required at least one paired input.'} />
            )}
          </Col>
        )}
        {(!props.maxInput || props.maxInput > 1) && (
          <Col xs="12" md="9">
            <Button
              size="sm"
              className="btn-pill"
              color="outline-primary"
              onClick={() => {
                if (props.maxInput && pairedFileInputFields.length >= props.maxInput) {
                  alert(`Only allows ${props.maxInput} end input data set(s).`)
                } else {
                  pairedFileInputAppend({ name: 'pairedFileInput' })
                  setDoValidation(doValidation + 1)
                }
              }}
            >
              Add more {props.text}&nbsp; <i className="cui-file"></i>
            </Button>
            <br></br>
            <br></br>
          </Col>
        )}
      </Row>

      {pairedFileInputFields.map((item, index) => (
        <div key={item.id}>
          <Row>
            {!props.maxInput || props.maxInput > 1 ? (
              <Col md="3" className="edge-sub-field">
                {' '}
                R1 {props.text} #{index + 1}
              </Col>
            ) : (
              <Col md="3"> R1 {props.text}</Col>
            )}
            <Col xs="12" md="9">
              <Controller
                render={({ field: { ref, ...rest }, fieldState }) => (
                  <FileSelector
                    {...rest}
                    {...fieldState}
                    enableInput={props.enableInput}
                    cleanupInput={props.cleanupInput}
                    placeholder={props.placeholder}
                    isValidFileInput={
                      form.fileInput_isValid[index] ? form.fileInput_isValid[index].f1 : false
                    }
                    dataSources={props.dataSources}
                    fileTypes={props.fileTypes}
                    projectTypes={props.projectTypes}
                    projectScope={props.projectScope}
                    viewFile={props.viewFile}
                    fieldname={'pairedFileInput1'}
                    index={index}
                    onChange={handleFileSelection}
                  />
                )}
                name={`fileInput[${index}].f1`}
                control={control}
              />
            </Col>
          </Row>
          <br></br>
          <Row>
            {!props.maxInput || props.maxInput > 1 ? (
              <Col md="3" className="edge-sub-field">
                {' '}
                R2 {props.text} #{index + 1}
              </Col>
            ) : (
              <Col md="3"> R2 {props.text}</Col>
            )}
            <Col xs="12" md="9">
              <Controller
                render={({ field: { ref, ...rest }, fieldState }) => (
                  <FileSelector
                    {...rest}
                    {...fieldState}
                    enableInput={props.enableInput}
                    cleanupInput={props.cleanupInput}
                    placeholder={props.placeholder}
                    isValidFileInput={
                      form.fileInput_isValid[index] ? form.fileInput_isValid[index].f2 : false
                    }
                    dataSources={props.dataSources}
                    fileTypes={props.fileTypes}
                    projectTypes={props.projectTypes}
                    viewFile={props.viewFile}
                    fieldname={'pairedFileInput2'}
                    index={index}
                    onChange={handleFileSelection}
                  />
                )}
                name={`fileInput[${index}].f2`}
                control={control}
              />
            </Col>
          </Row>
          {(!props.maxInput || props.maxInput > 1) && (
            <Row>
              <Col md="3"></Col>
              <Col xs="12" md="9">
                <Button
                  size="sm"
                  className="btn-pill"
                  color="ghost-primary"
                  onClick={() => {
                    form.fileInput.splice(index, 1)
                    form.fileInput_display.splice(index, 1)
                    form.fileInput_isValid.splice(index, 1)
                    pairedFileInputRemove(index)
                    setDoValidation(doValidation + 1)
                  }}
                >
                  {' '}
                  Remove{' '}
                </Button>
              </Col>
            </Row>
          )}
          <br></br>
        </div>
      ))}
    </>
  )
}
