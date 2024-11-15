import { createAsyncThunk } from '@reduxjs/toolkit'

import { putData } from 'src/edge/common/util'
import { apis } from 'src/epic/util'
import { addError } from '../messageSlice'

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

export const updateStructure = (structureData) => (dispatch, getState) => {
  dispatch(updateStructureAsync(structureData))
}
