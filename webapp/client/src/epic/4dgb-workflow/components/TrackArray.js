import React, { useState, useEffect } from 'react'
import { Col, Row, Button } from 'reactstrap'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { defaults } from 'src/edge/common/util'
import { components } from './defaults'
import { Track } from './Track'

export const TrackArray = (props) => {
  const componentName = 'trackArray'
  const [form, setState] = useState({ ...components[componentName] })
  const [doValidation, setDoValidation] = useState(0)
  const { control } = useForm({
    mode: defaults['form_mode'],
  })

  const {
    fields: trackFields,
    append: trackAppend,
    remove: trackRemove,
  } = useFieldArray({
    control,
    name: 'track',
  })

  const setTrackArray = (params, index) => {
    form.tracks[index] = { ...params }
    setDoValidation(doValidation + 1)
  }

  //default 0 dataset
  useEffect(() => {
    setState({ ...form, ['tracks']: [] })
    setDoValidation(doValidation + 1)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  //trigger validation method when input changes
  useEffect(() => {
    form.validForm = true
    form.errMessage = ''
    form.tracks.forEach((item) => {
      if (!item.validForm) {
        form.validForm = false
        form.errMessage = 'Input error'
      }
    })

    //force updating parent's inputParams
    props.setParams(form, props.name)
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Row>
        <Col md="3">Tracks</Col>
        <Col xs="12" md="9">
          <Button
            size="sm"
            className="btn-pill"
            color="outline-primary"
            onClick={() => {
              trackAppend({ name: 'track' })
              setDoValidation(doValidation + 1)
            }}
          >
            Add more track
          </Button>
        </Col>
      </Row>
      <br></br>
      {trackFields.map((item, index) => (
        <div key={item.id}>
          <Row>
            <Col md="3" className="edge-sub-field">
              track {index + 1}
            </Col>
            <Col xs="12" md="9">
              <Controller
                render={({ field: { ref, ...rest }, fieldState }) => (
                  <Track setParams={setTrackArray} index={index} />
                )}
                name={`track[${index}]`}
                control={control}
              />
            </Col>
          </Row>
          <Row>
            <Col md="3"></Col>
            <Col xs="12" md="9">
              <Button
                size="sm"
                className="btn-pill"
                color="outline-primary"
                onClick={() => {
                  form.tracks.splice(index, 1)
                  trackRemove(index)
                  setDoValidation(doValidation + 1)
                }}
              >
                Remove track {index + 1}
              </Button>
            </Col>
          </Row>
          <br></br>
        </div>
      ))}
    </>
  )
}
