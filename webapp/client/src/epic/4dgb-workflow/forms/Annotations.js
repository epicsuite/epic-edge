import React, { useState, useEffect } from 'react'
import { Card, CardBody, Col, Row, Collapse } from 'reactstrap'
import { Header } from 'src/edge/project/forms/SectionHeader'
import { HtmlText } from 'src/edge/common/HtmlText'
import { isValidFileInput } from 'src/edge/common/util'
import { Dataset } from '../components/Dataset'
import { components } from '../defaults'

export const Annotations = (props) => {
  const componentName = 'annotations'
  const [collapseParms, setCollapseParms] = useState(true)
  const [form, setState] = useState({ ...components[componentName] })
  const [doValidation, setDoValidation] = useState(0)

  const toggleParms = () => {
    setCollapseParms(!collapseParms)
  }

  //callback function for child component
  const setDataset = (inForm, name) => {
    form.inputs[name].value = {
      description: inForm.name,
      file: inForm.data,
    }
    form.inputs[name].display = {
      [form.inputs[name]['name'].text]: inForm.name,
      [form.inputs[name]['data'].text]: inForm.display,
    }
    setDoValidation(doValidation + 1)
  }

  //trigger validation method when input changes
  useEffect(() => {
    //validate form
    form.validForm = true
    form.errMessage = ''
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
          <Row>
            <Col md="3">{components[componentName]['inputs']['genes'].text}</Col>
            <Col xs="12" md="9">
              <Dataset
                key={'genes'}
                id={'genes'}
                name={components[componentName]['inputs']['genes']['name']}
                data={components[componentName]['inputs']['genes']['data']}
                isValidTextInput={() => {
                  return true
                }}
                isValidFileInput={isValidFileInput}
                setParams={setDataset}
              />
            </Col>
          </Row>
          <br></br>
          <Row>
            <Col md="3">{components[componentName]['inputs']['features'].text}</Col>
            <Col xs="12" md="9">
              <Dataset
                key={'features'}
                id={'features'}
                name={components[componentName]['inputs']['features']['name']}
                data={components[componentName]['inputs']['features']['data']}
                isValidTextInput={() => {
                  return true
                }}
                isValidFileInput={isValidFileInput}
                setParams={setDataset}
              />
            </Col>
          </Row>
          <br></br>
        </CardBody>
      </Collapse>
    </Card>
  )
}
