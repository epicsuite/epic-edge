import { createTheme } from '@mui/material'
import { colors } from '../../../edge/common/util'

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
  'export-data': 'Export selected datasets?',
  'create-session': 'Create session with selected datasets?',
}

const productId = new RegExp(/^\d{4}$/)
export const isValidProductId = (value) => !value.length || productId.test(value)
export const validateRequired = (value) => !!value.length
export const validateBoolean = (value) => ['true', 'false'].includes(value)
