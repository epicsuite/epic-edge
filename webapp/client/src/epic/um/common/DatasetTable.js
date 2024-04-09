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
  FileDownload,
  Forward,
} from '@mui/icons-material'
import moment from 'moment'
import ReactJson from 'react-json-view'

import { updateDatasetAdmin } from 'src/redux/reducers/epic/adminSlice'
import { updateDataset } from 'src/redux/reducers/epic/userSlice'
import { setSubmittingForm } from 'src/redux/reducers/pageSlice'
import { cleanError } from 'src/redux/reducers/messageSlice'
import { ConfirmDialog, LoaderDialog } from 'src/edge/common/Dialogs'
import { notify, getData, postData } from 'src/edge/common/util'
import { apis, datasetUrl } from '../../util'
import {
  theme,
  isValidProductId,
  validateRequired,
  validateBoolean,
  actionDialogMessages,
} from './tableUtil'
import UserSelector from 'src/edge/um/common/UserSelector'
import DatasetFormDialog from './DatasetFormDialog'

const DatasetTable = (props) => {
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
  const [datasets, setDatasets] = useState()
  const [validationErrors, setValidationErrors] = useState({})
  const [openDatasetDialog, setOpenDatasetDialog] = useState(false)

  useEffect(() => {
    if (props.tableType === 'admin' && user.profile.role !== 'admin') {
      navigate('/home')
    } else {
      getDatasets()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props, user])

  useEffect(() => {
    if (datasets && !page.submittingForm) {
      notifyUpdateResults()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasets, page])

  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    if (!Object.keys(validationErrors).length) {
      const oldData = row.original
      let newData = { ...oldData, name: values.name, desc: values.desc, public: values.public }
      let update = new Promise((resolve, reject) => {
        setOpenDialog(false)
        dispatch(cleanError())
        dispatch(setSubmittingForm(true))
        setDatasets([])
        setAction('update')
        const dataset = updateCurrDataset(newData, oldData)
        setDatasets([dataset])
        resolve(dataset)
        //wait for dataset updating complete
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
            isValid = isValidProductId(event.target.value)
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
        header: 'Name',
        accessorKey: 'metadata.name',
        enableEditing: false,
      },
      {
        header: 'Product Id',
        accessorKey: 'productId',
        enableEditing: false,
      },
      { header: 'Description', accessorKey: 'desc' },
      {
        header: 'Chromosome',
        accessorKey: 'metadata.chromosome',
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

  const reloadDatasets = () => {
    setSelectedData([])
    getDatasets()
  }

  const getDatasets = () => {
    let url = apis.userDatasets
    if (props.tableType === 'admin') {
      url = apis.adminDatasets
    }
    setLoading(true)
    getData(url)
      .then((data) => {
        let datasets = data.datasets.map((obj) => {
          let rObj = { ...obj }

          if (obj.sharedTo && obj.sharedTo.length > 0) {
            rObj['shared'] = true
          } else {
            rObj['shared'] = false
          }

          return rObj
        })
        setLoading(false)
        setTableData(datasets)
      })
      .catch((err) => {
        setLoading(false)
        alert(err)
      })
  }

  const updateCurrDataset = (dataset, oldDataset) => {
    if (props.tableType === 'admin') {
      dispatch(updateDatasetAdmin(dataset))
    } else {
      dispatch(updateDataset(dataset))
    }
    return oldDataset
  }

  const notifyUpdateResults = () => {
    let resetTable = false
    datasets.forEach((dataset) => {
      const actionTitle = startCase(action) + " dataset '" + dataset.name + "'"
      if (errors[dataset.code]) {
        notify('error', actionTitle + ' failed! ' + errors[dataset.code])
      } else {
        notify('success', actionTitle + ' successfully!')
        reloadDatasets()
        resetTable = true
      }
    })
    if (resetTable && table) {
      table.reset()
    }
  }

  const handleAction = (action, rows) => {
    if (action === 'refresh') {
      getDatasets()
      return
    }
    if (action === 'add') {
      setOpenDatasetDialog(true)
      return
    }
    if (rows.length === 0) {
      return
    }
    // 2 datasets required
    if (action === 'create-session' && rows.length !== 2) {
      alert('Must select 2 datasets')
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
    setDatasets([])

    //get user selector options
    if (action === 'share' || action === 'unshare') {
      setOpenUserSelector(true)
    } else if (action === 'export-data') {
      //exportData(seletedData)
    } else if (action === 'create-session') {
      // // store selectedData to localstorage
      // localStorage.setItem('datasets', JSON.stringify(selectedData))
      // // redirect to /genomeBrowser page
      // navigate('/genomeBrowser')

      // call api to launch a trame instance and redirect to genomeBrowser
      let formData = new FormData()

      let params = { datasets: selectedData }
      formData.append('params', JSON.stringify(params))

      setSubmitting(true)
      postData('/api/public/sessions/trame', formData)
        .then((data) => {
          setSubmitting(false)
          if (data.success) {
            navigate('/trame', { state: { url: data.url } })
          } else {
            alert(data.errMessage)
          }
        })
        .catch((error) => {
          setSubmitting(false)
          alert(error.errMessage)
        })
    } else {
      const promises = selectedData.map(async (dataset) => {
        return proccessDataset(dataset)
      })
      Promise.all(promises).then((results) => {
        setDatasets(results)
      })
      //wait for dataset updating complete
      setTimeout(() => {
        dispatch(setSubmittingForm(false))
      }, 500)
    }
  }

  const proccessDataset = (dataset) => {
    if (action === 'delete') {
      dataset.status = 'delete'
    } else if (action === 'publish') {
      dataset.public = true
    } else if (action === 'unpublish') {
      dataset.public = false
    }

    return updateCurrDataset(dataset, dataset)
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
    setDatasets([])

    const promises = selectedData.map((dataset) => {
      return processShareUnshareDataset(dataset)
    })
    Promise.all(promises).then((results) => {
      setDatasets(results)
    })
    //wait for dataset updating complete
    setTimeout(() => {
      dispatch(setSubmittingForm(false))
    }, 500)
  }

  const processShareUnshareDataset = (dataset) => {
    if (action === 'share') {
      let sharedTo = dataset.sharedTo
      userList.map((user) => {
        if (dataset.owner === user) {
        } else if (!sharedTo.includes(user)) {
          sharedTo.push(user)
        }
        return 1
      })

      dataset.sharedTo = sharedTo
    } else if (action === 'unshare') {
      let sharedTo = dataset.sharedTo
      userList.map((user) => {
        var index = sharedTo.indexOf(user)
        sharedTo.splice(index, 1)
        return 1
      })

      dataset.sharedTo = sharedTo
    }

    return updateCurrDataset(dataset, dataset)
  }

  const handleUserSelectorClose = () => {
    setOpenUserSelector(false)
  }
  const handleDatasetFormDialogSuccess = () => {
    setOpenDatasetDialog(false)
    notify('success', 'Your new dataset was submitted successfully!')
    getDatasets()
  }
  const handleDatasetFormDialogClose = () => {
    setOpenDatasetDialog(false)
  }

  return (
    <>
      <ToastContainer />
      <LoaderDialog loading={submitting === true} text="Loading ..." />
      <ConfirmDialog
        isOpen={openDialog}
        action={action}
        header={'Are you sure to ' + action + ' the selected datasets?'}
        message={actionDialogMessages[action]}
        handleClickYes={handleConfirmYes}
        handleClickClose={handleConfirmClose}
      />
      <DatasetFormDialog
        isOpen={openDatasetDialog}
        handleSuccess={handleDatasetFormDialogSuccess}
        handleClickClose={handleDatasetFormDialogClose}
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
            labelRowsPerPage: 'datasets per page',
          }}
          renderEmptyRowsFallback={() => (
            <center>
              <br></br>No datasets to display
            </center>
          )}
          renderDetailPanel={({ row }) => (
            <Row className="justify-content-center">
              <Col xs="12" sm="12" md="1">
                <img
                  crossOrigin="anonymous"
                  style={{ width: 100, height: 100 }}
                  src={datasetUrl + '/' + row.original.code + '/' + row.original.metadata.thumbnail}
                />
              </Col>
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
              <Col xs="12" sm="12" md="2">
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
                    <Tooltip title="Add new dataset" aria-label="add">
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
                  <Tooltip title="Delete selected datasets" aria-label="delete">
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
                  <Tooltip title="Share selected datasets" aria-label="share">
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
                  <Tooltip title="Unshare selected datasets" aria-label="unshare">
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
                  <Tooltip title="Publish selected datasets" aria-label="publish">
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
                  <Tooltip title="Unpublish selected datasets" aria-label="unpublish">
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
                    <Tooltip title="Export selected datasets" aria-label="export-data">
                      <Fab
                        color="primary"
                        size="small"
                        style={{ marginRight: 10 }}
                        aria-label="export-data"
                      >
                        <FileDownload
                          onClick={() => {
                            setTable(table)
                            handleAction('export-data', table.getSelectedRowModel().flatRows)
                          }}
                        />
                      </Fab>
                    </Tooltip>
                  )}
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

export default DatasetTable
