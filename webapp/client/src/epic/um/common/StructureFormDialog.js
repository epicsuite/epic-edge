import React, { useState, useEffect } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form } from 'reactstrap'
import { TextInput } from 'src/edge/project/forms/TextInput'
import { postData } from 'src/edge/common/util'
import { LoaderDialog } from 'src/edge/common/Dialogs'
import { apis } from '../../util'
import { isValid4dgbProductId } from './tableUtil'

const StructureFormDialog = (props) => {
  const [disableSubmit, setDisableSubmit] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [doValidation, setDoValidation] = useState(0)
  const [validInputs] = useState({
    productId: { isValid: false, error: 'Product Id input error.' },
  })
  const [form, setState] = useState({
    validForm: false,
    errMessage: null,
    productId: null,
  })
  const params = {
    productId: {
      text: 'Product Id',
      placeholder: 'required',
      showError: false,
      isOptional: false,
      showErrorTooltip: true,
      errMessage: 'Required. Valid id example: eda-fduh0l8m',
    },
  }
  const setTextInput = (inForm, name) => {
    if (inForm.validForm) {
      setState({
        ...form,
        [name]: inForm.textInput,
      })
      if (validInputs[name]) {
        validInputs[name].isValid = true
      }
    } else {
      setState({
        ...form,
        [name]: 0,
      })
      if (validInputs[name]) {
        validInputs[name].isValid = false
      }
    }
    setDoValidation(doValidation + 1)
  }

  //submit button clicked
  const onSubmit = () => {
    setSubmitting(true)
    let formData = { id: form.productId }
    // submit to server via api
    postData(apis.userStructures, formData)
      .then((data) => {
        setSubmitting(false)
        props.handleSuccess()
      })
      .catch((error) => {
        setSubmitting(false)
        alert(JSON.stringify(error))
      })
  }

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

    if (form.validForm) {
      setDisableSubmit(false)
    } else {
      setDisableSubmit(true)
    }
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal isOpen={props.isOpen} centered>
      <LoaderDialog loading={submitting === true} text="Submitting..." />
      <Form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <ModalHeader className="justify-content-center">{'Add new structure dataset'}</ModalHeader>
        <ModalBody>
          <TextInput
            name={'productId'}
            setParams={setTextInput}
            text={params['productId'].text}
            showErrorTooltip={params['productId'].showErrorTooltip}
            isOptional={params['productId'].isOptional}
            note={params['productId'].note}
            placeholder={params['productId'].placeholder}
            errMessage={params['productId'].errMessage}
            isValidTextInput={isValid4dgbProductId}
          />
        </ModalBody>
        <ModalFooter className="justify-content-center">
          <Button color="primary" disabled={disableSubmit} onClick={(e) => onSubmit()}>
            Submit
          </Button>{' '}
          <Button color="secondary" onClick={props.handleClickClose}>
            Cancel
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  )
}

export default StructureFormDialog
