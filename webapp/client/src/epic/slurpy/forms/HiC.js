import React, { useState, useEffect } from 'react'
import { Card, CardBody, Col, Row, Collapse } from 'reactstrap'
import { Header } from 'src/edge/project/forms/SectionHeader'
import { HtmlText } from 'src/edge/project/forms/HtmlText'
import { FastqInput } from 'src/edge/project/forms/FastqInput'
import { TextInput } from 'src/edge/project/forms/TextInput'
import { RangeInput } from 'src/edge/project/forms/RangeInput'
import { IntegerInput } from 'src/edge/project/forms/IntegerInput'
import { SelectInput } from 'src/edge/project/forms/SelectInput'
import { FileInput } from 'src/edge/project/forms/FileInput'
import { isValidFileInput } from 'src/edge/common/util'
import { isValidChromosome } from 'src/epic/util'
import { components } from '../defaults'

export const HiC = (props) => {
  const componentName = 'hic'
  const [collapseParms, setCollapseParms] = useState(false)
  const [form, setState] = useState({ ...components[componentName] })
  const [validInputs, setValidInputs] = useState({ ...components[componentName].validInputs })
  const [doValidation, setDoValidation] = useState(0)

  const toggleParms = () => {
    setCollapseParms(!collapseParms)
  }

  const setFastqInput = (inForm, name) => {
    if (inForm.validForm) {
      form.inputs['pairedFile'].value = !inForm.interleaved
      form.inputs[name].value = inForm.fileInput
      form.inputs[name].display = inForm.fileInput_display
      if (validInputs[name]) {
        validInputs[name].isValid = true
      }
    } else {
      form.inputs['pairedFile'].value = inForm.interleaved
      form.inputs[name].value = []
      form.inputs[name].display = []
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
  const setSelectInput = (inForm, name) => {
    form.inputs[name].value = inForm.selectInput
    setDoValidation(doValidation + 1)
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
      //files for server to caculate total input size
      //form.files = [...form.inputs['inputFastq'].value, form.inputs['artifactFile'].value]
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
            <FastqInput
              name={'inputFastq'}
              setParams={setFastqInput}
              isValidFileInput={isValidFileInput}
              text={components[componentName].inputs['inputFastq'].text}
              tooltip={components[componentName].inputs['inputFastq']['fastqInput'].tooltip}
              enableInput={components[componentName].inputs['inputFastq']['fastqInput'].enableInput}
              placeholder={components[componentName].inputs['inputFastq']['fastqInput'].placeholder}
              dataSources={components[componentName].inputs['inputFastq']['fastqInput'].dataSources}
              fileTypes={components[componentName].inputs['inputFastq']['fastqInput'].fileTypes}
              viewFile={components[componentName].inputs['inputFastq']['fastqInput'].viewFile}
              isOptional={components[componentName].inputs['inputFastq']['fastqInput'].isOptional}
              cleanupInput={
                components[componentName].inputs['inputFastq']['fastqInput'].cleanupInput
              }
              maxInput={components[componentName].inputs['inputFastq']['fastqInput'].maxInput}
            />
            <FileInput
              name={'referenceBwaIndex'}
              setParams={setFileInput}
              isValidFileInput={isValidFileInput}
              text={components[componentName].inputs['referenceBwaIndex'].text}
              tooltip={components[componentName].inputs['referenceBwaIndex']['fileInput'].tooltip}
              enableInput={
                components[componentName].inputs['referenceBwaIndex']['fileInput'].enableInput
              }
              placeholder={
                components[componentName].inputs['referenceBwaIndex']['fileInput'].placeholder
              }
              dataSources={
                components[componentName].inputs['referenceBwaIndex']['fileInput'].dataSources
              }
              fileTypes={
                components[componentName].inputs['referenceBwaIndex']['fileInput'].fileTypes
              }
              viewFile={components[componentName].inputs['referenceBwaIndex']['fileInput'].viewFile}
              isOptional={
                components[componentName].inputs['referenceBwaIndex']['fileInput'].isOptional
              }
              cleanupInput={
                components[componentName].inputs['referenceBwaIndex']['fileInput'].cleanupInput
              }
            />
            <br></br>
            <TextInput
              name={'mtDNA'}
              setParams={setTextInput}
              text={components[componentName].inputs['mtDNA'].text}
              tooltip={components[componentName].inputs['mtDNA']['textInput'].tooltip}
              defaultValue={components[componentName].inputs['mtDNA']['textInput'].defaultValue}
              isOptional={components[componentName].inputs['mtDNA']['textInput'].isOptional}
              placeholder={components[componentName].inputs['mtDNA']['textInput'].placeholder}
              errMessage={components[componentName].inputs['mtDNA']['textInput'].errMessage}
              isValidTextInput={isValidChromosome}
            />
            <br></br>
            <RangeInput
              name={'mapThreshold'}
              setParams={setRangeInput}
              text={components[componentName].inputs['mapThreshold'].text}
              tooltip={components[componentName].inputs['mapThreshold']['rangeInput'].tooltip}
              defaultValue={
                components[componentName].inputs['mapThreshold']['rangeInput'].defaultValue
              }
              min={components[componentName].inputs['mapThreshold']['rangeInput'].min}
              max={components[componentName].inputs['mapThreshold']['rangeInput'].max}
              step={components[componentName].inputs['mapThreshold']['rangeInput'].step}
            />
            <br></br>
            <IntegerInput
              name={'errorDistance'}
              id={'errorDistance'}
              setParams={setIntegerInput}
              text={components[componentName].inputs['errorDistance'].text}
              tooltip={components[componentName].inputs['errorDistance']['integerInput'].tooltip}
              defaultValue={
                components[componentName].inputs['errorDistance']['integerInput'].defaultValue
              }
              min={components[componentName].inputs['errorDistance']['integerInput'].min}
              max={components[componentName].inputs['errorDistance']['integerInput'].max}
            />
            <br></br>
            <IntegerInput
              name={'selfCircle'}
              id={'selfCircle'}
              setParams={setIntegerInput}
              text={components[componentName].inputs['selfCircle'].text}
              tooltip={components[componentName].inputs['selfCircle']['integerInput'].tooltip}
              defaultValue={
                components[componentName].inputs['selfCircle']['integerInput'].defaultValue
              }
              min={components[componentName].inputs['selfCircle']['integerInput'].min}
              max={components[componentName].inputs['selfCircle']['integerInput'].max}
            />
            <br></br>
            <SelectInput
              name={'library'}
              id={'library'}
              setParams={setSelectInput}
              text={components[componentName].inputs['library'].text}
              tooltip={components[componentName].inputs['library']['selectInput'].tooltip}
              setDefault={components[componentName].inputs['library']['selectInput'].setDefault}
              options={components[componentName].inputs['library']['selectInput'].options}
              isOptional={components[componentName].inputs['library']['selectInput'].isOptional}
              placeholder={components[componentName].inputs['library']['selectInput'].placeholder}
              isClearable={components[componentName].inputs['library']['selectInput'].isClearable}
            />
            <br></br>
            <IntegerInput
              name={'mindist'}
              id={'mindist'}
              setParams={setIntegerInput}
              text={components[componentName].inputs['mindist'].text}
              tooltip={components[componentName].inputs['mindist']['integerInput'].tooltip}
              defaultValue={
                components[componentName].inputs['mindist']['integerInput'].defaultValue
              }
              min={components[componentName].inputs['mindist']['integerInput'].min}
              max={components[componentName].inputs['mindist']['integerInput'].max}
            />
            <br></br>
            <FileInput
              name={'genomelist'}
              setParams={setFileInput}
              isValidFileInput={isValidFileInput}
              text={components[componentName].inputs['genomelist'].text}
              tooltip={components[componentName].inputs['genomelist']['fileInput'].tooltip}
              enableInput={components[componentName].inputs['genomelist']['fileInput'].enableInput}
              placeholder={components[componentName].inputs['genomelist']['fileInput'].placeholder}
              dataSources={components[componentName].inputs['genomelist']['fileInput'].dataSources}
              fileTypes={components[componentName].inputs['genomelist']['fileInput'].fileTypes}
              viewFile={components[componentName].inputs['genomelist']['fileInput'].viewFile}
              isOptional={components[componentName].inputs['genomelist']['fileInput'].isOptional}
              cleanupInput={
                components[componentName].inputs['genomelist']['fileInput'].cleanupInput
              }
            />
            <br></br>
          </CardBody>
        </Collapse>
      </Card>
    </>
  )
}
