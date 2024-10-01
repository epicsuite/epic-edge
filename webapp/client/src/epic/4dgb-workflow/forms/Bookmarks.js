import React, { useState, useEffect } from 'react'
import { Card, CardBody, Col, Row, Collapse } from 'reactstrap'
import { Header } from 'src/edge/project/forms/SectionHeader'
import { HtmlText } from 'src/edge/common/HtmlText'
import { isValidTextInput } from '../../util'
import { RangeTextInputArray } from 'src/edge/project/forms/RangeTextInputArray'
import { TextInputArray } from 'src/edge/project/forms/TextInputArray'
import { components } from '../defaults'

export const Bookmarks = (props) => {
  const componentName = 'bookmarks'
  const [collapseParms, setCollapseParms] = useState(true)
  const [form, setState] = useState({ ...components[componentName] })
  const [validInputs, setValidInputs] = useState({ ...components[componentName].validInputs })
  const [doValidation, setDoValidation] = useState(0)

  const toggleParms = () => {
    setCollapseParms(!collapseParms)
  }

  //callback function for child component
  const setLocationArray = (inForm, name) => {
    if (inForm.validForm) {
      inForm.rangeInputs.forEach((item, index) => {
        form.inputs[name].value[index] = [item.start, item.end]
      })
      if (validInputs[name]) {
        validInputs[name].isValid = true
      }
    } else {
      let errMessage = ''
      inForm.rangeInputs.forEach((item, index) => {
        let locationNumber = index + 1
        if (!item.validForm) {
          form.validForm = false
          errMessage += 'location range ' + locationNumber + ' error</br>'
        }
      })
      if (validInputs[name]) {
        validInputs[name].isValid = false
        validInputs[name].error = errMessage
      }
    }

    setDoValidation(doValidation + 1)
  }

  //callback function for child component
  const setFeatureArray = (inForm, name) => {
    if (inForm.validForm) {
      inForm.textInputs.forEach((item, index) => {
        form.inputs[name].value[index] = item.textInput
      })
      if (validInputs[name]) {
        validInputs[name].isValid = true
      }
    } else {
      let errMessage = ''
      inForm.textInputs.forEach((item, index) => {
        let featureNumber = index + 1
        if (!item.validForm) {
          form.validForm = false
          errMessage += 'feature range ' + featureNumber + ' error</br>'
        }
      })
      if (validInputs[name]) {
        validInputs[name].isValid = false
        validInputs[name].error = errMessage
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
        errors += validInputs[key].error
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
          <RangeTextInputArray
            name={'locations'}
            setParams={setLocationArray}
            text={components[componentName].inputs['locations'].text}
            tooltip={components[componentName].inputs['locations']['rangeTextInputArray'].tooltip}
            defaultValueStart={
              components[componentName].inputs['locations']['rangeTextInputArray'].defaultValueStart
            }
            minStart={components[componentName].inputs['locations']['rangeTextInputArray'].minStart}
            maxStart={components[componentName].inputs['locations']['rangeTextInputArray'].maxStart}
            defaultValueEnd={
              components[componentName].inputs['locations']['rangeTextInputArray'].defaultValueEnd
            }
            minEnd={components[componentName].inputs['locations']['rangeTextInputArray'].minEnd}
            maxEnd={components[componentName].inputs['locations']['rangeTextInputArray'].maxEnd}
            rangeText={
              components[componentName].inputs['locations']['rangeTextInputArray'].rangeText
            }
            startText={
              components[componentName].inputs['locations']['rangeTextInputArray'].startText
            }
            endText={components[componentName].inputs['locations']['rangeTextInputArray'].endText}
          />
          <TextInputArray
            name={'features'}
            setParams={setFeatureArray}
            text={components[componentName].inputs['features'].text}
            inputText={components[componentName].inputs['features']['textInputArray'].inputText}
            tooltip={components[componentName].inputs['features']['textInputArray'].tooltip}
            isValidTextInput={isValidTextInput}
          />
          <br></br>
          <br></br>
        </CardBody>
      </Collapse>
    </Card>
  )
}
