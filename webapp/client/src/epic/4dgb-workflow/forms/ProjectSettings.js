import React, { useState, useEffect } from 'react'
import { Card, CardBody, Collapse } from 'reactstrap'
import { Header } from 'src/edge/project/forms/SectionHeader'
import { HtmlText } from 'src/edge/project/forms/HtmlText'
import { TextInput } from 'src/edge/project/forms/TextInput'
import { RangeInput } from 'src/edge/project/forms/RangeInput'
import { IntegerInput } from 'src/edge/project/forms/IntegerInput'
import { RangeTextInputArray } from 'src/edge/project/forms/RangeTextInputArray'
import { isValidChromosome } from 'src/epic/util'
import { components } from '../defaults'

export const ProjectSettings = (props) => {
  const componentName = 'projectSettings'
  const [collapseParms, setCollapseParms] = useState(false)
  const [form, setState] = useState({ ...components[componentName] })
  const [validInputs, setValidInputs] = useState({ ...components[componentName].validInputs })
  const [doValidation, setDoValidation] = useState(0)

  const toggleParms = () => {
    setCollapseParms(!collapseParms)
  }

  const setRangeInput = (inForm, name) => {
    form.inputs[name].value = inForm.rangeInput
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

  const setRangeTextInputArray = (inForm, name) => {
    if (inForm.validForm) {
      let ranges = []
      inForm.rangeInputs.forEach((item, index) => {
        ranges[index] = [item.start, item.end]
      })
      form.inputs[name].value = ranges
      if (validInputs[name]) {
        validInputs[name].isValid = true
      }
    } else {
      form.inputs[name].value = []
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
            name={'chromosome'}
            setParams={setTextInput}
            text={components[componentName].inputs['chromosome'].text}
            tooltip={components[componentName].inputs['chromosome']['textInput'].tooltip}
            defaultValue={components[componentName].inputs['chromosome']['textInput'].defaultValue}
            isOptional={components[componentName].inputs['chromosome']['textInput'].isOptional}
            placeholder={components[componentName].inputs['chromosome']['textInput'].placeholder}
            errMessage={components[componentName].inputs['chromosome']['textInput'].errMessage}
            isValidTextInput={isValidChromosome}
          />
          <br></br>
          <RangeInput
            name={'count_threshold'}
            setParams={setRangeInput}
            text={components[componentName].inputs['count_threshold'].text}
            tooltip={components[componentName].inputs['count_threshold']['rangeInput'].tooltip}
            defaultValue={
              components[componentName].inputs['count_threshold']['rangeInput'].defaultValue
            }
            min={components[componentName].inputs['count_threshold']['rangeInput'].min}
            max={components[componentName].inputs['count_threshold']['rangeInput'].max}
            step={components[componentName].inputs['count_threshold']['rangeInput'].step}
          />
          <br></br>
          <RangeInput
            name={'distance_threshold'}
            setParams={setRangeInput}
            text={components[componentName].inputs['distance_threshold'].text}
            tooltip={components[componentName].inputs['distance_threshold']['rangeInput'].tooltip}
            defaultValue={
              components[componentName].inputs['distance_threshold']['rangeInput'].defaultValue
            }
            min={components[componentName].inputs['distance_threshold']['rangeInput'].min}
            max={components[componentName].inputs['distance_threshold']['rangeInput'].max}
            step={components[componentName].inputs['distance_threshold']['rangeInput'].step}
          />
          <br></br>
          <RangeTextInputArray
            name={'blackout'}
            setParams={setRangeTextInputArray}
            text={components[componentName].inputs['blackout'].text}
            tooltip={components[componentName].inputs['blackout']['rangeTextInputArray'].tooltip}
            defaultValueStart={
              components[componentName].inputs['blackout']['rangeTextInputArray'].defaultValueStart
            }
            minStart={components[componentName].inputs['blackout']['rangeTextInputArray'].minStart}
            maxStart={components[componentName].inputs['blackout']['rangeTextInputArray'].maxStart}
            defaultValueEnd={
              components[componentName].inputs['blackout']['rangeTextInputArray'].defaultValueEnd
            }
            minEnd={components[componentName].inputs['blackout']['rangeTextInputArray'].minEnd}
            maxEnd={components[componentName].inputs['blackout']['rangeTextInputArray'].maxEnd}
            rangeText={
              components[componentName].inputs['blackout']['rangeTextInputArray'].rangeText
            }
            startText={
              components[componentName].inputs['blackout']['rangeTextInputArray'].startText
            }
            endText={components[componentName].inputs['blackout']['rangeTextInputArray'].endText}
          />
          <br></br>
          <IntegerInput
            name={'bond_coeff'}
            id={'bond_coeff'}
            setParams={setIntegerInput}
            text={components[componentName].inputs['bond_coeff'].text}
            tooltip={components[componentName].inputs['bond_coeff']['integerInput'].tooltip}
            defaultValue={
              components[componentName].inputs['bond_coeff']['integerInput'].defaultValue
            }
            min={components[componentName].inputs['bond_coeff']['integerInput'].min}
            max={components[componentName].inputs['bond_coeff']['integerInput'].max}
          />
          <br></br>
        </CardBody>
      </Collapse>
    </Card>
  )
}
