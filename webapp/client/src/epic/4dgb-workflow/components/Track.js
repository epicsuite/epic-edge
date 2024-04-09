import React, { useState, useEffect } from 'react'
import { Col, Row } from 'reactstrap'
import { isValidFileInput } from 'src/edge/common/util'
import { isValidTextInput } from 'src/epic/util'
import { Dataset } from './Dataset'
import { components } from './defaults'

export const Track = (props) => {
  const componentName = 'track'
  const [form, setState] = useState({ ...components[componentName] })
  const [validInputs, setValidInputs] = useState({ ...components[componentName].validInputs })
  const [doValidation, setDoValidation] = useState(0)

  const setTrackDataset = (inForm, name) => {
    if (inForm.validForm) {
      form.inputs[name].value = {
        name: inForm.name,
        data: inForm.data,
      }
      form.inputs[name].display = {
        name: inForm.name,
        data: inForm.display,
      }
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

  const setColumnDataset = (inForm, index) => {
    let name = 'column' + index
    if (inForm.validForm) {
      form.inputs['columns'][index].value = {
        name: inForm.name,
        data: inForm.data,
      }
      form.inputs['columns'][index].display = {
        name: inForm.name,
        data: inForm.display,
      }
      if (validInputs[name]) {
        validInputs[name].isValid = true
      }
    } else {
      form.inputs['columns'][index].value = null
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
    props.setParams(form, props.index)
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Dataset
        key={'track'}
        id={'track'}
        name={components[componentName].inputs['track']['name']}
        data={components[componentName].inputs['track']['data']}
        isValidTextInput={isValidTextInput}
        isValidFileInput={isValidFileInput}
        setParams={setTrackDataset}
      />
      <br></br>
      {components[componentName].inputs['columns'].map((item, index) => (
        <Row key={index}>
          <Col md="3"> Column {index + 1} </Col>
          <Col xs="12" md="9">
            <Dataset
              key={index}
              id={index}
              name={item['name']}
              data={item['data']}
              isValidTextInput={isValidTextInput}
              isValidFileInput={isValidFileInput}
              setParams={setColumnDataset}
            />
          </Col>
        </Row>
      ))}
      <br></br>
      <br></br>
    </>
  )
}
