import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Col, Row } from 'reactstrap'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import startCase from 'lodash.startcase'
import { MaterialReactTable } from 'material-react-table'
import { ThemeProvider, Box, MenuItem, IconButton, Tooltip } from '@mui/material'
import Fab from '@mui/material/Fab'
import {
  Delete,
  Edit,
  Refresh,
  PersonAdd,
  PersonAddDisabled,
  Lock,
  LockOpen,
  Add,
  Forward,
} from '@mui/icons-material'
import moment from 'moment'
import ReactJson from 'react-json-view'

import { updateStructureAdmin } from 'src/redux/reducers/epic/adminSlice'
import { updateStructure } from 'src/redux/reducers/epic/userSlice'
import { setSubmittingForm } from 'src/redux/reducers/pageSlice'
import { cleanError } from 'src/redux/reducers/messageSlice'
import { ConfirmDialog, LoaderDialog } from 'src/edge/common/Dialogs'
import { notify, getData } from 'src/edge/common/util'
import { apis } from '../../util'
import {
  theme,
  isValid4dgbProductId,
  validateRequired,
  validateBoolean,
  actionDialogMessages,
} from './tableUtil'
import { submitTrameSession } from '../../util'
import UserSelector from 'src/edge/um/common/UserSelector'
import StructureFormDialog from './StructureFormDialog'

const StructureTable = (props) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const errors = useSelector((state) => state.message.errors)
  const page = useSelector((state) => state.page)
  const [submitting, setSubmitting] = useState(false)

  const [table, setTable] = useState()
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedData, setSelectedData] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [action, setAction] = useState('')
  const [openUserSelector, setOpenUserSelector] = useState(false)
  const [userList, setUserlist] = useState([])
  const [structures, setStructures] = useState()
  const [validationErrors, setValidationErrors] = useState({})
  const [openStructureDialog, setOpenStructureDialog] = useState(false)

  useEffect(() => {
    if (props.tableType === 'admin' && user.profile.role !== 'admin') {
      navigate('/home')
    } else {
      getStructures()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props, user])

  useEffect(() => {
    if (structures && !page.submittingForm) {
      notifyUpdateResults()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structures, page])

  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    if (!Object.keys(validationErrors).length) {
      const oldData = row.original
      let newData = { ...oldData, name: values.name, desc: values.desc, public: values.public }
      let update = new Promise((resolve, reject) => {
        setOpenDialog(false)
        dispatch(cleanError())
        dispatch(setSubmittingForm(true))
        setStructures([])
        setAction('update')
        const structure = updateCurrStructure(newData, oldData)
        setStructures([structure])
        resolve(structure)
        //wait for structure updating complete
        setTimeout(() => {
          dispatch(setSubmittingForm(false))
        }, 200)
      })
      await update
      exitEditingMode() //required to exit editing mode and close modal
    }
  }

  const handleCancelRowEdits = () => {
    setValidationErrors({})
  }

  const getCommonEditTextFieldProps = useCallback(
    (cell) => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
        onBlur: (event) => {
          let isValid = validateRequired(event.target.value)
          if (cell.column.id === 'public') {
            isValid = validateBoolean(event.target.value)
          } else if (cell.column.id === 'productId') {
            isValid = isValid4dgbProductId(event.target.value)
          }

          if (!isValid) {
            //set validation error for cell if invalid
            if (cell.column.id === 'public') {
              setValidationErrors({
                ...validationErrors,
                [cell.id]: `${cell.column.columnDef.header} is required. Valid values: true, false`,
              })
            } else if (cell.column.id === 'name') {
              setValidationErrors({
                ...validationErrors,
                [cell.id]: `${cell.column.columnDef.header} is required, at 3 but less than 30 characters. Only alphabets, numbers, dashs, dot and underscore are allowed in the name.`,
              })
            } else {
              setValidationErrors({
                ...validationErrors,
                [cell.id]: `${cell.column.columnDef.header} is required`,
              })
            }
          } else {
            //remove validation error for cell if valid
            delete validationErrors[cell.id]
            setValidationErrors({
              ...validationErrors,
            })
          }
        },
      }
    },
    [validationErrors],
  )
  //should be memoized or stable
  const columns = useMemo(
    () => [
      {
        header: 'Product Id',
        accessorKey: 'productId',
        enableEditing: false,
      },
      {
        header: 'Chromosome',
        accessorKey: 'chromosome',
        enableEditing: false,
      },
      {
        header: 'Resolution',
        accessorKey: 'resolution',
        enableEditing: false,
      },
      {
        header: 'Species',
        accessorKey: 'metadata.identity.species',
        enableEditing: false,
      },
      {
        header: 'Description',
        accessorKey: 'metadata.identity.description',
        enableEditing: false,
      },
      {
        header: 'State',
        accessorKey: 'metadata.identity.state',
        enableEditing: false,
      },
      {
        header: 'Author',
        accessorKey: 'metadata.source.author',
        enableEditing: false,
      },
      {
        header: 'Owner',
        accessorKey: 'owner',
        enableEditing: false,
      },
      {
        header: 'Shared',
        accessorKey: 'shared',
        Cell: ({ cell }) => <> {cell.getValue() ? 'true' : 'false'}</>,
        enableColumnActions: false,
        enableEditing: false,
        enableGlobalFilter: false,
        size: 100, //decrease the width of this column
      },
      {
        header: 'Public',
        accessorKey: 'public',
        Cell: ({ cell }) => <> {cell.getValue() ? 'true' : 'false'}</>,
        muiTableBodyCellEditTextFieldProps: {
          select: true, //change to select for a dropdown
          children: ['true', 'false'].map((state) => (
            <MenuItem key={state} value={state}>
              {state}
            </MenuItem>
          )),
        },
        size: 100, //decrease the width of this column
      },
      {
        header: 'Created',
        accessorKey: 'created',
        Cell: ({ cell }) => <>{moment(cell.getValue()).format('MM/DD/YYYY, h:mm:ss A')}</>,
        enableEditing: false,
        enableColumnFilter: false,
      },
      {
        header: 'Updated',
        accessorKey: 'updated',
        Cell: ({ cell }) => <>{moment(cell.getValue()).format('MM/DD/YYYY, h:mm:ss A')}</>,
        enableEditing: false,
        enableColumnFilter: false,
      },
    ],
    [getCommonEditTextFieldProps],
  )

  const reloadStructures = () => {
    setSelectedData([])
    getStructures()
  }

  const getStructures = () => {
    let url = apis.userStructures
    if (props.tableType === 'admin') {
      url = apis.adminStructures
    }
    setLoading(true)
    getData(url)
      .then((data) => {
        let structures = data.structures.map((obj) => {
          let rObj = { ...obj }

          if (obj.sharedTo && obj.sharedTo.length > 0) {
            rObj['shared'] = true
          } else {
            rObj['shared'] = false
          }

          return rObj
        })
        setLoading(false)
        setTableData(structures)
      })
      .catch((err) => {
        setLoading(false)
        alert(err)
      })
  }

  const updateCurrStructure = (structure, oldStructure) => {
    if (props.tableType === 'admin') {
      dispatch(updateStructureAdmin(structure))
    } else {
      dispatch(updateStructure(structure))
    }
    return oldStructure
  }

  const notifyUpdateResults = () => {
    let resetTable = false
    structures.forEach((structure) => {
      const actionTitle = startCase(action) + " structure '" + structure.name + "'"
      if (errors[structure.code]) {
        notify('error', actionTitle + ' failed! ' + errors[structure.code])
      } else {
        notify('success', actionTitle + ' successfully!')
        reloadStructures()
        resetTable = true
      }
    })
    if (resetTable && table) {
      table.reset()
    }
  }

  const handleAction = (action, rows) => {
    if (action === 'refresh') {
      getStructures()
      return
    }
    if (action === 'add') {
      setOpenStructureDialog(true)
      return
    }
    if (rows.length === 0) {
      return
    }
    // 2 structures required
    if (action === 'create-session' && rows.length !== 1) {
      alert('Must select 1 structure')
      return
    }
    const selectedRows = rows.map((row) => {
      return row.original
    })
    setSelectedData(selectedRows)
    setOpenDialog(true)
    setAction(action)
  }

  const handleConfirmClose = () => {
    setOpenDialog(false)
  }

  const handleConfirmYes = async () => {
    setOpenDialog(false)
    dispatch(cleanError())
    dispatch(setSubmittingForm(true))
    setStructures([])

    //get user selector options
    if (action === 'share' || action === 'unshare') {
      setOpenUserSelector(true)
    } else if (action === 'create-session') {
      // // store selectedData to localstorage
      // localStorage.setItem('structures', JSON.stringify(selectedData))
      // // redirect to /trame page
      // navigate('/trame')

      // call api to launch a trame instance and redirect to trame
      let params = { structure: selectedData[0]['code'], app: 'structure' }
      setSubmitting(true)
      submitTrameSession(params, 'user')
        .then((data) => {
          setSubmitting(false)
          navigate('/trame', { state: { url: data.url } })
        })
        .catch((error) => {
          setSubmitting(false)
          alert(error)
        })
    } else {
      const promises = selectedData.map(async (structure) => {
        return proccessStructure(structure)
      })
      Promise.all(promises).then((results) => {
        setStructures(results)
      })
      //wait for structure updating complete
      setTimeout(() => {
        dispatch(setSubmittingForm(false))
      }, 500)
    }
  }

  const proccessStructure = (structure) => {
    if (action === 'delete') {
      structure.status = 'delete'
    } else if (action === 'publish') {
      structure.public = true
    } else if (action === 'unpublish') {
      structure.public = false
    }

    return updateCurrStructure(structure, structure)
  }

  const handleUserSelectorChange = (selectedUsers) => {
    setUserlist(
      selectedUsers.map((user) => {
        return user.value
      }),
    )
  }

  const handleUserSelectorYes = async () => {
    setOpenUserSelector(false)
    setOpenDialog(false)
    dispatch(cleanError())
    dispatch(setSubmittingForm(true))
    setStructures([])

    const promises = selectedData.map((structure) => {
      return processShareUnshareStructure(structure)
    })
    Promise.all(promises).then((results) => {
      setStructures(results)
    })
    //wait for structure updating complete
    setTimeout(() => {
      dispatch(setSubmittingForm(false))
    }, 500)
  }

  const processShareUnshareStructure = (structure) => {
    if (action === 'share') {
      let sharedTo = structure.sharedTo
      userList.map((user) => {
        if (structure.owner === user) {
        } else if (!sharedTo.includes(user)) {
          sharedTo.push(user)
        }
        return 1
      })

      structure.sharedTo = sharedTo
    } else if (action === 'unshare') {
      let sharedTo = structure.sharedTo
      userList.map((user) => {
        var index = sharedTo.indexOf(user)
        sharedTo.splice(index, 1)
        return 1
      })

      structure.sharedTo = sharedTo
    }

    return updateCurrStructure(structure, structure)
  }

  const handleUserSelectorClose = () => {
    setOpenUserSelector(false)
  }
  const handleStructureFormDialogSuccess = () => {
    setOpenStructureDialog(false)
    notify('success', 'Your new structure was submitted successfully!')
    getStructures()
  }
  const handleStructureFormDialogClose = () => {
    setOpenStructureDialog(false)
  }

  return (
    <>
      <ToastContainer />
      <LoaderDialog loading={submitting === true} text="Loading ..." />
      <ConfirmDialog
        isOpen={openDialog}
        action={action}
        header={'Are you sure to ' + action + ' the selected structures?'}
        message={actionDialogMessages[action]}
        handleClickYes={handleConfirmYes}
        handleClickClose={handleConfirmClose}
      />
      <StructureFormDialog
        isOpen={openStructureDialog}
        handleSuccess={handleStructureFormDialogSuccess}
        handleClickClose={handleStructureFormDialogClose}
      />
      {openUserSelector && (
        <UserSelector
          type={props.tableType}
          isOpen={openUserSelector}
          action={action}
          onChange={handleUserSelectorChange}
          handleClickYes={handleUserSelectorYes}
          handleClickClose={handleUserSelectorClose}
        />
      )}
      <ThemeProvider theme={theme}>
        <MaterialReactTable
          columns={columns}
          data={tableData}
          enableFullScreenToggle={false}
          enableRowSelection
          enableRowActions={false}
          positionActionsColumn="first"
          enableEditing
          state={{
            isLoading: loading,
          }}
          initialState={{
            columnVisibility: { owner: false, created: false },
            sorting: [{ id: 'productId' }],
          }}
          muiTablePaginationProps={{
            rowsPerPageOptions: [10, 20, 50, 100],
            labelRowsPerPage: 'structures per page',
          }}
          renderEmptyRowsFallback={() => (
            <center>
              <br></br>No structures to display
            </center>
          )}
          renderDetailPanel={({ row }) => (
            <Row className="justify-content-center">
              <Col xs="12" sm="12" md="9">
                <ReactJson
                  src={row.original.metadata}
                  name={'Metadata'}
                  enableClipboard={false}
                  displayDataTypes={false}
                  displayObjectSize={false}
                  collapsed={false}
                />
              </Col>
              <Col xs="12" sm="12" md="3">
                {(props.tableType === 'admin' || row.original.owner === user.profile.email) && (
                  <>
                    <br></br>
                    <b>Shared To:</b> {row.original.sharedTo.join(', ')}
                  </>
                )}
              </Col>
            </Row>
          )}
          onEditingRowSave={handleSaveRowEdits}
          onEditingRowCancel={handleCancelRowEdits}
          renderRowActions={({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <Tooltip arrow placement="bottom" title="Edit">
                <IconButton onClick={() => table.setEditingRow(row)}>
                  <Edit />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          renderTopToolbarCustomActions={({ table }) => {
            return (
              <div>
                <div className="edge-table-title">{props.title}</div>
                <br></br>
                <div className="edge-table-toptoolbar">
                  <Tooltip title="Refresh table" aria-label="refresh">
                    <Fab
                      color="primary"
                      size="small"
                      style={{ marginRight: 10 }}
                      aria-label="refresh"
                    >
                      <Refresh
                        onClick={() => {
                          handleAction('refresh')
                          table.reset()
                        }}
                      />
                    </Fab>
                  </Tooltip>
                  {props.tableType === 'user' && (
                    <Tooltip title="Add new structure" aria-label="add">
                      <Fab
                        color="primary"
                        size="small"
                        style={{ marginRight: 10 }}
                        aria-label="add"
                      >
                        <Add
                          onClick={() => {
                            handleAction('add')
                            table.reset()
                          }}
                        />
                      </Fab>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete selected structures" aria-label="delete">
                    <Fab
                      color="primary"
                      size="small"
                      style={{ marginRight: 10 }}
                      aria-label="delete"
                    >
                      <Delete
                        onClick={() => {
                          setTable(table)
                          handleAction('delete', table.getSelectedRowModel().flatRows)
                        }}
                      />
                    </Fab>
                  </Tooltip>
                  <br></br>
                  <Tooltip title="Share selected structures" aria-label="share">
                    <Fab
                      color="primary"
                      size="small"
                      style={{ marginRight: 10 }}
                      aria-label="share"
                    >
                      <PersonAdd
                        onClick={() => {
                          setTable(table)
                          handleAction('share', table.getSelectedRowModel().flatRows)
                        }}
                      />
                    </Fab>
                  </Tooltip>
                  <Tooltip title="Unshare selected structures" aria-label="unshare">
                    <Fab
                      color="primary"
                      size="small"
                      style={{ marginRight: 10 }}
                      aria-label="unshare"
                    >
                      <PersonAddDisabled
                        onClick={() => {
                          setTable(table)
                          handleAction('unshare', table.getSelectedRowModel().flatRows)
                        }}
                      />
                    </Fab>
                  </Tooltip>
                  <Tooltip title="Publish selected structures" aria-label="publish">
                    <Fab
                      color="primary"
                      size="small"
                      style={{ marginRight: 10 }}
                      aria-label="publish"
                    >
                      <LockOpen
                        onClick={() => {
                          setTable(table)
                          handleAction('publish', table.getSelectedRowModel().flatRows)
                        }}
                      />
                    </Fab>
                  </Tooltip>
                  <Tooltip title="Unpublish selected structures" aria-label="unpublish">
                    <Fab
                      color="primary"
                      size="small"
                      style={{ marginRight: 10 }}
                      aria-label="unpublish"
                    >
                      <Lock
                        onClick={() => {
                          setTable(table)
                          handleAction('unpublish', table.getSelectedRowModel().flatRows)
                        }}
                      />
                    </Fab>
                  </Tooltip>
                  {props.tableType === 'user' && (
                    <Tooltip title="Create session" aria-label="create-session">
                      <Fab
                        color="primary"
                        size="small"
                        style={{ marginRight: 10 }}
                        aria-label="create-session"
                      >
                        <Forward
                          onClick={() => {
                            setTable(table)
                            handleAction('create-session', table.getSelectedRowModel().flatRows)
                          }}
                        />
                      </Fab>
                    </Tooltip>
                  )}
                </div>
              </div>
            )
          }}
        />
      </ThemeProvider>
    </>
  )
}

export default StructureTable
