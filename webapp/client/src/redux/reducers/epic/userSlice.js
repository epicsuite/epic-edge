import { createAsyncThunk } from '@reduxjs/toolkit'

import { setAuthToken, postData, putData } from '../../../edge/common/util'
import { apis } from '../../../epic/util'
import { setSubmittingForm } from '../pageSlice'
import { addMessage, cleanMessage, addError, cleanError } from '../messageSlice'

const updateDatasetAsync = createAsyncThunk(
  'user/updateDataset',
  async (datasetData, { dispatch }) => {
    try {
      await putData(`${apis.userDatasets}/${datasetData.code}`, datasetData)
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
const updateStructureAsync = createAsyncThunk(
  'user/updateStructure',
  async (structureData, { dispatch }) => {
    try {
      await putData(`${apis.userStructures}/${structureData.code}`, structureData)
    } catch (err) {
      if (typeof err === 'string') {
        dispatch(addError({ [structureData.code]: err }))
      } else {
        if (err.error) {
          dispatch(addError({ [structureData.code]: JSON.stringify(err.error) }))
        } else {
          dispatch(addError({ [structureData.code]: 'API server error' }))
        }
      }
    }
  },
)

export const updateDataset = (datasetData) => (dispatch, getState) => {
  dispatch(updateDatasetAsync(datasetData))
}
export const updateStructure = (structureData) => (dispatch, getState) => {
  dispatch(updateStructureAsync(structureData))
}
