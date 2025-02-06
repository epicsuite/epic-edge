import { createTheme } from '@mui/material'
import { colors } from 'src/edge/common/util'

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.info,
    },
  },
})

export const actionDialogMessages = {
  '': 'This action is not undoable.',
  update: 'This action is not undoable.',
  delete: 'This action is not undoable.',
  share: "You can use 'unshare' to undo this action.",
  unshare: "You can use 'share' to undo this action.",
  publish: "You can use 'unpublish' to undo this action.",
  unpublish: "You can use 'publish' to undo this action.",
  'create-session': 'Create session with selected structure dataset?',
}

const productId = new RegExp(/^\d{4}$/)
export const isValidProductId = (value) => !value.length || productId.test(value)
export const validateRequired = (value) => !!value.length
export const validateBoolean = (value) => ['true', 'false'].includes(value)
const productId2 = new RegExp(/^[a-zA-Z]{3}-[a-zA-Z0-9]{8}$/)
export const isValid4dgbProductId = (value) => !value.length || productId2.test(value)
