import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarShow: false,
}

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setSidebar: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      if (typeof action.payload === 'undefined') {
        state.sidebarShow = !state.sidebarShow
      } else {
        state.sidebarShow = action.payload
      }
    },
  },
})

export const { setSidebar } = sidebarSlice.actions

export default sidebarSlice.reducer
