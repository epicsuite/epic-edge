import { configureStore } from '@reduxjs/toolkit'
// import logger from 'redux-logger'
import sidebarReducer from './reducers/sidebarSlice'
import userReducer from './reducers/edge/userSlice'
import pageReducer from './reducers/pageSlice'
import messageReducer from './reducers/messageSlice'

// The thunk middleware was automatically added
const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    user: userReducer,
    page: pageReducer,
    message: messageReducer,
  },
  //middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
})

export default store
