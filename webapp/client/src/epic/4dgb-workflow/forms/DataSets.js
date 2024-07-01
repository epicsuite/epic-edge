import React, { useState, useEffect } from 'react'
import { Card, CardBody, Col, Row, Collapse } from 'reactstrap'
import { Header } from 'src/edge/project/forms/SectionHeader'
import { HtmlText } from 'src/edge/project/forms/HtmlText'
import { isValidFileInput } from 'src/edge/common/util'
import { isValidTextInput } from 'src/epic/util'
import { Dataset } from '../components/Dataset'
import { components } from '../defaults'

export const DataSets = (props) => {
  const componentName = 'datasets'
  const [collapseParms, setCollapseParms] = useState(false)
  const [form, setState] = useState({ ...components[componentName] })
  const [validInputs, setValidInputs] = useState({ ...components[componentName].validInputs })
  const [doValidation, setDoValidation] = useState(0)

  const toggleParms = () => {
    setCollapseParms(!collapseParms)
  }

  const setDataset = (inForm, index) => {
    let name = 'dataset' + index
    if (inForm.validForm) {
      form.inputs['datasetArray'][index].value = {
        name: inForm.name,
        data: inForm.data,
      }
      form.inputs['datasetArray'][index].display = {
        [form.inputs['datasetArray'][index]['name'].text]: inForm.name,
        [form.inputs['datasetArray'][index]['data'].text]: inForm.display,
      }
      if (validInputs[name]) {
        validInputs[name].isValid = true
      }
    } else {
      form.inputs['datasetArray'][index].value = null
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
          {components[componentName].inputs['datasetArray'].map((item, index) => (
            <Row key={index}>
              <Col md="3"> Dataset {index + 1} </Col>
              <Col xs="12" md="9">
                <Dataset
                  key={index}
                  id={index}
                  name={item['name']}
                  data={item['data']}
                  isValidTextInput={isValidTextInput}
                  isValidFileInput={isValidFileInput}
                  setParams={setDataset}
                />
              </Col>
            </Row>
          ))}
          <br></br>
        </CardBody>
      </Collapse>
    </Card>
  )
}
