import { createAsyncThunk } from '@reduxjs/toolkit'

import { putData, deleteData } from '../../../edge/common/util'
import { apis } from '../../../epic/util'
import { setSubmittingForm } from '../pageSlice'
import { cleanMessage, addError, cleanError } from '../messageSlice'

const updateDatasetAsync = createAsyncThunk(
  'admin/updateDataset',
  async (datasetData, { dispatch }) => {
    try {
      await putData(`${apis.adminDatasets}/${datasetData.code}`, datasetData)
    } catch (err) {
      if (typeof err === 'string') {
        dispatch(addError({ [datasetData.code]: err }))
      } else {
        if (err.error) {
          dispatch(addError({ [datasetData.code]: JSON.stringify(err.error) }))
        } else {
          dispatch(addError({ [datasetData.code]: 'API server error' }))
        }
      }
    }
  },
)

export const updateDatasetAdmin = (datasetData) => (dispatch, getState) => {
  dispatch(updateDatasetAsync(datasetData))
}
