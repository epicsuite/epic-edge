import React, { useState, useEffect } from 'react'
import { notify, getData } from '../../edge/common/util'
import { datasetUrl } from '../util'

const DataViz = (props) => {
  const [text, setText] = useState('')
  useEffect(() => {
    let url = datasetUrl + '/' + props.dataset.code + '/structure.csv'
    getData(url)
      .then((data) => {
        setText(data)
      })
      .catch((err) => {
        alert(err)
      })
  }, [props])

  return (
    <>
      {props.dataset.productId}
      <br></br>
      <div className="edge-display-linebreak edge-component-center">
        <textarea
          name="textarea-input"
          id="textarea-input"
          cols={100}
          rows={20}
          value={text}
          readOnly
        />
      </div>
    </>
  )
}

export default DataViz
