import React, { useState, useEffect } from 'react'
import { Col, Row } from 'reactstrap'
import { MyTooltip, ErrorTooltip } from '../../common/MyTooltip'
import { defaults } from '../../common/util'
import FolderSelector from './FolderSelector'
import { components } from './defaults'

export const FolderInput = (props) => {
  const componentName = 'folderInput'
  const [form, setState] = useState({ ...components[componentName] })
  const [doValidation, setDoValidation] = useState(0)

  const handleFolderSelection = (foldername, foldername_display, files) => {
    form.folderInput = foldername
    form.folderInput_display = foldername_display
    form.files = files
    //validation
    if (props.isOptional || foldername) {
      form.validForm = true
    } else {
      form.validForm = false
    }
    setDoValidation(doValidation + 1)
  }

  useEffect(() => {
    setState({ ...components[componentName] })
  }, [props.reset]) // eslint-disable-line react-hooks/exhaustive-deps

  //trigger validation method when input changes
  useEffect(() => {
    //force updating parent's inputParams
    if (props.isOptional || form.folderInput) {
      form.validForm = true
    }
    props.setParams(form, props.name)
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Row>
        <Col md="3">
          {props.tooltip ? (
            <MyTooltip
              id={`folderInputTooltip-${props.name}`}
              tooltip={props.tooltip}
              text={props.text}
              place={props.tooltipPlace ? props.tooltipPlace : defaults.tooltipPlace}
              color={props.tooltipColor ? props.tooltipColor : defaults.tooltipColor}
              showTooltip={props.showTooltip ? props.showTooltip : defaults.showTooltip}
            />
          ) : (
            <>{props.text}</>
          )}
          {!form.validForm && props.errMessage && props.showErrorTooltip && (
            <ErrorTooltip
              id={`folderInputErrTooltip-${props.name}`}
              tooltip={form.folderInput ? 'Invalid input' : props.errMessage}
            />
          )}
        </Col>
        <Col xs="12" md="9">
          <FolderSelector
            onChange={handleFolderSelection}
            enableInput={props.enableInput}
            placeholder={props.placeholder}
            isValidFolderInput={form.validForm}
            dataSources={props.dataSources}
            projectScope={props.projectScope}
            projectTypes={props.projectTypes}
            fileTypes={props.fileTypes}
            fieldname={props.name}
            isOptional={props.isOptional ? props.isOptional : false}
            cleanupInput={props.cleanupInput ? props.cleanupInput : false}
          />
        </Col>
      </Row>
    </>
  )
}
