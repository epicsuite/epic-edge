import React, { useState, useEffect } from 'react'
import { Card, CardBody, Collapse } from 'reactstrap'
import { Header } from 'src/edge/project/forms/SectionHeader'
import { HtmlText } from 'src/edge/project/forms/HtmlText'
import { TrackArray } from '../components/TrackArray'
import { components } from '../defaults'

export const Tracks = (props) => {
  const componentName = 'tracks'
  const [collapseParms, setCollapseParms] = useState(true)
  const [form, setState] = useState({ ...components[componentName] })
  const [doValidation, setDoValidation] = useState(0)

  const toggleParms = () => {
    setCollapseParms(!collapseParms)
  }

  //callback function for child component
  const setTrackArray = (inForm, name) => {
    if (inForm.validForm) {
      form.validForm = true
      form.errMessage = ''
      inForm.tracks.forEach((item, index) => {
        form.inputs[name].value[index] = {
          name: item.inputs.track.value.name,
          file: item.inputs.track.value.data,
          columns: [
            {
              name: item.inputs.columns[0].value.name,
              file: item.inputs.columns[0].value.data,
            },
            {
              name: item.inputs.columns[1].value.name,
              file: item.inputs.columns[1].value.data,
            },
          ],
        }
        form.inputs[name].display[index] = {
          [item.inputs.track.name.text]: item.inputs.track.display.name,
          [item.inputs.track.data.text]: item.inputs.track.display.data,
          columns: [
            {
              [item.inputs.columns[0].name.text]: item.inputs.columns[0].display.name,
              [item.inputs.columns[0].data.text]: item.inputs.columns[0].display.data,
            },
            {
              [item.inputs.columns[1].name.text]: item.inputs.columns[1].display.name,
              [item.inputs.columns[1].data.text]: item.inputs.columns[1].display.data,
            },
          ],
        }
      })
    } else {
      form.validForm = false
      let errMessage = ''
      inForm.tracks.forEach((item, index) => {
        let trackNumber = index + 1
        if (!item.validForm) {
          form.validForm = false
          errMessage += 'track ' + trackNumber + ' error</br>'
        }
      })
      form.errMessage = errMessage
    }

    setDoValidation(doValidation + 1)
  }
  //trigger validation method when input changes
  useEffect(() => {
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
          <TrackArray id={'tracks'} name={'trackArray'} setParams={setTrackArray} />
          <br></br>
        </CardBody>
      </Collapse>
    </Card>
  )
}
