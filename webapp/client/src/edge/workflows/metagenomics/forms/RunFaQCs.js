import React, { useState, useEffect } from 'react'
import { Card, CardBody, Collapse } from 'reactstrap'
import { isValidFileInput } from '../../../common/util'
import { Header } from '../../../project/forms/SectionHeader'
import { FastqInput } from '../../../project/forms/FastqInput'
import { RangeInput } from '../../../project/forms/RangeInput'
import { Switcher } from '../../../project/forms/Switcher'
import { FileInput } from '../../../project/forms/FileInput'
import { IntegerInput } from '../../../project/forms/IntegerInput'
import { workflows } from '../defaults'

export const RunFaQCs = (props) => {
  const workflowName = 'runFaQCs'
  const [collapseParms, setCollapseParms] = useState(false)
  const [form] = useState({ ...workflows[workflowName] })
  const [validInputs] = useState({ ...workflows[workflowName].validInputs })
  const [doValidation, setDoValidation] = useState(0)

  const toggleParms = () => {
    setCollapseParms(!collapseParms)
  }

  const setRangeInput = (inForm, name) => {
    form.inputs[name].value = inForm.rangeInput
    setDoValidation(doValidation + 1)
  }

  const setIntegerInput = (inForm, name) => {
    //console.log(inForm, name)
    if (inForm.validForm) {
      form.inputs[name].value = inForm.integerInput
      if (validInputs[name]) {
        validInputs[name].isValid = true
      }
    } else {
      form.inputs[name].value = 0
      if (validInputs[name]) {
        validInputs[name].isValid = false
      }
    }
    setDoValidation(doValidation + 1)
  }

  const setSwitcher = (inForm, name) => {
    form.inputs[name].value = inForm.isTrue
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

  const setFastqInput = (inForm, name) => {
    if (inForm.validForm) {
      form.inputs['interleaved'].value = inForm.interleaved
      if (inForm.interleaved) {
        form.inputs[name].value = inForm.fileInput
        form.inputs[name].display = inForm.fileInput_display
      } else {
        form.inputs[name].value = [inForm.fileInput[0].f1, inForm.fileInput[0].f2]
        form.inputs[name].display = [inForm.fileInput_display[0].f1, inForm.fileInput_display[0].f2]
      }
      if (validInputs[name]) {
        validInputs[name].isValid = true
      }
    } else {
      // reset values
      form.inputs['interleaved'].value = true
      form.inputs[name].value = []
      form.inputs[name].display = []
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
      form.files = [...form.inputs['inputFastq'].value, form.inputs['artifactFile'].value]
      form.errMessage = null
      form.validForm = true
    } else {
      form.errMessage = errors
      form.validForm = false
    }
    //force updating parent's inputParams
    props.setParams(form, props.name)
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="workflow-card">
      <Header
        toggle={true}
        toggleParms={toggleParms}
        title={'Input'}
        collapseParms={collapseParms}
        id={workflowName + 'input'}
        isValid={props.isValid}
        errMessage={props.errMessage}
      />
      <Collapse isOpen={!collapseParms} id={'collapseParameters-' + props.name}>
        <CardBody>
          <FastqInput
            name={'inputFastq'}
            setParams={setFastqInput}
            isValidFileInput={isValidFileInput}
            text={workflows[workflowName].inputs['inputFastq'].text}
            tooltip={workflows[workflowName].inputs['inputFastq']['fastqInput'].tooltip}
            enableInput={workflows[workflowName].inputs['inputFastq']['fastqInput'].enableInput}
            placeholder={workflows[workflowName].inputs['inputFastq']['fastqInput'].placeholder}
            dataSources={workflows[workflowName].inputs['inputFastq']['fastqInput'].dataSources}
            fileTypes={workflows[workflowName].inputs['inputFastq']['fastqInput'].fileTypes}
            viewFile={workflows[workflowName].inputs['inputFastq']['fastqInput'].viewFile}
            isOptional={workflows[workflowName].inputs['inputFastq']['fastqInput'].isOptional}
            cleanupInput={workflows[workflowName].inputs['inputFastq']['fastqInput'].cleanupInput}
            maxInput={workflows[workflowName].inputs['inputFastq']['fastqInput'].maxInput}
          />
          <RangeInput
            name={'trimQual'}
            setParams={setRangeInput}
            text={workflows[workflowName].inputs['trimQual'].text}
            tooltip={workflows[workflowName].inputs['trimQual']['rangeInput'].tooltip}
            defaultValue={workflows[workflowName].inputs['trimQual']['rangeInput'].defaultValue}
            min={workflows[workflowName].inputs['trimQual']['rangeInput'].min}
            max={workflows[workflowName].inputs['trimQual']['rangeInput'].max}
            step={workflows[workflowName].inputs['trimQual']['rangeInput'].step}
          />
          <br></br>
          <RangeInput
            name={'trim5end'}
            setParams={setRangeInput}
            text={workflows[workflowName].inputs['trim5end'].text}
            tooltip={workflows[workflowName].inputs['trim5end']['rangeInput'].tooltip}
            defaultValue={workflows[workflowName].inputs['trim5end']['rangeInput'].defaultValue}
            min={workflows[workflowName].inputs['trim5end']['rangeInput'].min}
            max={workflows[workflowName].inputs['trim5end']['rangeInput'].max}
            step={workflows[workflowName].inputs['trim5end']['rangeInput'].step}
          />
          <br></br>
          <RangeInput
            name={'trim3end'}
            setParams={setRangeInput}
            text={workflows[workflowName].inputs['trim3end'].text}
            tooltip={workflows[workflowName].inputs['trim3end']['rangeInput'].tooltip}
            defaultValue={workflows[workflowName].inputs['trim3end']['rangeInput'].defaultValue}
            min={workflows[workflowName].inputs['trim3end']['rangeInput'].min}
            max={workflows[workflowName].inputs['trim3end']['rangeInput'].max}
            step={workflows[workflowName].inputs['trim3end']['rangeInput'].step}
          />
          <br></br>
          <Switcher
            id={'trimAdapter'}
            name={'trimAdapter'}
            setParams={setSwitcher}
            text={workflows[workflowName].inputs['trimAdapter'].text}
            tooltip={workflows[workflowName].inputs['trimAdapter']['switcher'].tooltip}
            defaultValue={workflows[workflowName].inputs['trimAdapter']['switcher'].defaultValue}
            trueText={workflows[workflowName].inputs['trimAdapter']['switcher'].trueText}
            falseText={workflows[workflowName].inputs['trimAdapter']['switcher'].falseText}
          />
          <br></br>
          <RangeInput
            name={'trimRate'}
            setParams={setRangeInput}
            text={workflows[workflowName].inputs['trimRate'].text}
            tooltip={workflows[workflowName].inputs['trimRate']['rangeInput'].tooltip}
            defaultValue={workflows[workflowName].inputs['trimRate']['rangeInput'].defaultValue}
            min={workflows[workflowName].inputs['trimRate']['rangeInput'].min}
            max={workflows[workflowName].inputs['trimRate']['rangeInput'].max}
            step={workflows[workflowName].inputs['trimRate']['rangeInput'].step}
          />
          <br></br>
          <Switcher
            id={'trimPolyA'}
            name={'trimPolyA'}
            setParams={setSwitcher}
            text={workflows[workflowName].inputs['trimPolyA'].text}
            tooltip={workflows[workflowName].inputs['trimPolyA']['switcher'].tooltip}
            defaultValue={workflows[workflowName].inputs['trimPolyA']['switcher'].defaultValue}
            trueText={workflows[workflowName].inputs['trimPolyA']['switcher'].trueText}
            falseText={workflows[workflowName].inputs['trimPolyA']['switcher'].falseText}
          />
          <br></br>
          <FileInput
            name={'artifactFile'}
            setParams={setFileInput}
            isValidFileInput={isValidFileInput}
            text={workflows[workflowName].inputs['artifactFile'].text}
            tooltip={workflows[workflowName].inputs['artifactFile']['fileInput'].tooltip}
            enableInput={workflows[workflowName].inputs['artifactFile']['fileInput'].enableInput}
            placeholder={workflows[workflowName].inputs['artifactFile']['fileInput'].placeholder}
            dataSources={workflows[workflowName].inputs['artifactFile']['fileInput'].dataSources}
            fileTypes={workflows[workflowName].inputs['artifactFile']['fileInput'].fileTypes}
            viewFile={workflows[workflowName].inputs['artifactFile']['fileInput'].viewFile}
            isOptional={workflows[workflowName].inputs['artifactFile']['fileInput'].isOptional}
            cleanupInput={workflows[workflowName].inputs['artifactFile']['fileInput'].cleanupInput}
          />
          <br></br>
          <IntegerInput
            name={'minLen'}
            setParams={setIntegerInput}
            text={workflows[workflowName].inputs['minLen'].text}
            tooltip={workflows[workflowName].inputs['minLen']['integerInput'].tooltip}
            defaultValue={workflows[workflowName].inputs['minLen']['integerInput'].defaultValue}
            min={workflows[workflowName].inputs['minLen']['integerInput'].min}
            max={workflows[workflowName].inputs['minLen']['integerInput'].max}
          />
          <br></br>
          <RangeInput
            name={'avgQual'}
            setParams={setRangeInput}
            text={workflows[workflowName].inputs['avgQual'].text}
            tooltip={workflows[workflowName].inputs['avgQual']['rangeInput'].tooltip}
            defaultValue={workflows[workflowName].inputs['avgQual']['rangeInput'].defaultValue}
            min={workflows[workflowName].inputs['avgQual']['rangeInput'].min}
            max={workflows[workflowName].inputs['avgQual']['rangeInput'].max}
            step={workflows[workflowName].inputs['avgQual']['rangeInput'].step}
          />
          <br></br>
          <RangeInput
            name={'numN'}
            setParams={setRangeInput}
            text={workflows[workflowName].inputs['numN'].text}
            tooltip={workflows[workflowName].inputs['numN']['rangeInput'].tooltip}
            defaultValue={workflows[workflowName].inputs['numN']['rangeInput'].defaultValue}
            min={workflows[workflowName].inputs['numN']['rangeInput'].min}
            max={workflows[workflowName].inputs['numN']['rangeInput'].max}
            step={workflows[workflowName].inputs['numN']['rangeInput'].step}
          />
          <br></br>
          <RangeInput
            name={'filtLC'}
            setParams={setRangeInput}
            text={workflows[workflowName].inputs['filtLC'].text}
            tooltip={workflows[workflowName].inputs['filtLC']['rangeInput'].tooltip}
            defaultValue={workflows[workflowName].inputs['filtLC']['rangeInput'].defaultValue}
            min={workflows[workflowName].inputs['filtLC']['rangeInput'].min}
            max={workflows[workflowName].inputs['filtLC']['rangeInput'].max}
            step={workflows[workflowName].inputs['filtLC']['rangeInput'].step}
          />
          <br></br>
          <Switcher
            id={'filtPhiX'}
            name={'filtPhiX'}
            setParams={setSwitcher}
            text={workflows[workflowName].inputs['filtPhiX'].text}
            tooltip={workflows[workflowName].inputs['filtPhiX']['switcher'].tooltip}
            defaultValue={workflows[workflowName].inputs['filtPhiX']['switcher'].defaultValue}
            trueText={workflows[workflowName].inputs['filtPhiX']['switcher'].trueText}
            falseText={workflows[workflowName].inputs['filtPhiX']['switcher'].falseText}
          />
          <br></br>
        </CardBody>
      </Collapse>
    </Card>
  )
}
