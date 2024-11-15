import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Badge } from 'reactstrap'
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
  Explore,
} from '@mui/icons-material'
import moment from 'moment'

import { updateProjectAdmin } from '../../../redux/reducers/edge/adminSlice'
import { updateProject } from '../../../redux/reducers/edge/userSlice'
import { setSubmittingForm } from '../../../redux/reducers/pageSlice'
import { cleanError } from '../../../redux/reducers/messageSlice'
import { ConfirmDialog } from '../../common/Dialogs'
import { notify, getData, apis, isValidProjectName } from '../../common/util'
import { workflowList } from 'src/util'
import {
  theme,
  projectStatusColors,
  projectStatusNames,
  validateRequired,
  validateBoolean,
} from './tableUtil'
import UserSelector from './UserSelector'

const actionDialogs = {
  '': { message: 'This action is not undoable.' },
  update: { message: 'This action is not undoable.' },
  rerun: { message: 'This action is not undoable.' },
  delete: { message: 'This action is not undoable.' },
  share: { message: "You can use 'unshare' to undo this action." },
  unshare: { message: "You can use 'share' to undo this action." },
  publish: { message: "You can use 'unpublish' to undo this action." },
  unpublish: { message: "You can use 'publish' to undo this action." },
  export: { message: 'Export metadata of the selected projects to a csv file.' },
}

const SraDataTable = (props) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const errors = useSelector((state) => state.message.errors)
  const page = useSelector((state) => state.page)

  const [table, setTable] = useState()
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedData, setSelectedData] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [action, setAction] = useState('')
  const [openUserSelector, setOpenUserSelector] = useState(false)
  const [userList, setUserlist] = useState([])
  const [projectPageUrl, setProjectPageUrl] = useState('/user/project?code=')
  const [projects, setProjects] = useState()
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    if (props.tableType === 'admin' && user.profile.role !== 'admin') {
      navigate('/home')
    } else {
      if (props.tableType === 'admin') {
        setProjectPageUrl('/admin/project?code=')
      }
      getProjects()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props, user])

  useEffect(() => {
    if (projects && !page.submittingForm) {
      notifyUpdateResults()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, page])

  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    if (!Object.keys(validationErrors).length) {
      const oldData = row.original
      let newData = { ...oldData, name: values.name, desc: values.desc, public: values.public }
      let update = new Promise((resolve, reject) => {
        setOpenDialog(false)
        dispatch(cleanError())
        dispatch(setSubmittingForm(true))
        setProjects([])
        setAction('update')
        const proj = updateProj(newData, oldData)
        setProjects([proj])
        resolve(proj)
        //wait for project updating complete
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
          } else if (cell.column.id === 'name') {
            isValid = isValidProjectName(event.target.value)
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
        accessorKey: 'name',
        Cell: ({ cell }) => <>{cell.getValue().replace(/,/g, ', ')}</>,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
        }),
        enableEditing: false,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        Cell: ({ cell }) => (
          <Badge color={projectStatusColors[cell.getValue()]}>
            {projectStatusNames[cell.getValue()]}
          </Badge>
        ),
        enableEditing: false,
        size: 100, //decrease the width of this column
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

  const reloadProjects = () => {
    setSelectedData([])
    getProjects()
  }

  const getProjects = () => {
    let url = apis.userProjects
    if (props.tableType === 'admin') {
      url = apis.adminProjects
    }
    url += '/type/sra2fastq'
    console.log(url)
    setLoading(true)
    getData(url)
      .then((data) => {
        let projects = data.projects.map((obj) => {
          let rObj = { ...obj }

          if (obj.sharedTo && obj.sharedTo.length > 0) {
            rObj['shared'] = true
          } else {
            rObj['shared'] = false
          }

          return rObj
        })
        setLoading(false)
        setTableData(projects)
      })
      .catch((err) => {
        setLoading(false)
        alert(err)
      })
  }

  const updateProj = (proj, oldProj) => {
    if (props.tableType === 'admin') {
      dispatch(updateProjectAdmin(proj))
    } else {
      dispatch(updateProject(proj))
    }
    return oldProj
  }

  const notifyUpdateResults = () => {
    let resetTable = false
    projects.forEach((proj) => {
      const actionTitle = startCase(action) + " project '" + proj.name + "'"
      if (errors[proj.code]) {
        notify('error', actionTitle + ' failed! ' + errors[proj.code])
      } else {
        notify('success', actionTitle + ' successfully!')
        reloadProjects()
        resetTable = true
      }
    })
    if (resetTable && table) {
      table.reset()
    }
  }

  const handleAction = (action, rows) => {
    if (action === 'refresh') {
      getProjects()
      return
    }
    if (rows.length === 0) {
      return
    }
    const selectRows = rows.map((row) => {
      return row.original
    })
    setSelectedData(selectRows)
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
    setProjects([])

    //get user selector options
    if (action === 'share' || action === 'unshare') {
      setOpenUserSelector(true)
    } else if (action === 'export') {
      //do exporting
    } else {
      const promises = selectedData.map(async (proj) => {
        return proccessProject(proj)
      })
      Promise.all(promises).then((results) => {
        setProjects(results)
      })
      //wait for project updating complete
      setTimeout(() => {
        dispatch(setSubmittingForm(false))
      }, 500)
    }
  }

  const proccessProject = (proj) => {
    if (action === 'delete') {
      proj.status = 'delete'
    } else if (action === 'rerun') {
      proj.status = 'rerun'
    } else if (action === 'publish') {
      proj.public = true
    } else if (action === 'unpublish') {
      proj.public = false
    }

    return updateProj(proj, proj)
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
    setProjects([])

    const promises = selectedData.map((proj) => {
      return processShareUnshareProject(proj)
    })
    Promise.all(promises).then((results) => {
      setProjects(results)
    })
    //wait for project updating complete
    setTimeout(() => {
      dispatch(setSubmittingForm(false))
    }, 500)
  }

  const processShareUnshareProject = (proj) => {
    if (action === 'share') {
      let sharedTo = proj.sharedTo
      userList.map((user) => {
        if (proj.owner === user) {
        } else if (!sharedTo.includes(user)) {
          sharedTo.push(user)
        }
        return 1
      })

      proj.sharedTo = sharedTo
    } else if (action === 'unshare') {
      let sharedTo = proj.sharedTo
      userList.map((user) => {
        var index = sharedTo.indexOf(user)
        sharedTo.splice(index, 1)
        return 1
      })

      proj.sharedTo = sharedTo
    }

    return updateProj(proj, proj)
  }

  const handleUserSelectorClose = () => {
    setOpenUserSelector(false)
  }

  return (
    <>
      <ToastContainer />
      <ConfirmDialog
        isOpen={openDialog}
        action={action}
        header={'Are you sure to ' + action + ' the selected projects?'}
        message={actionDialogs[action].message}
        handleClickYes={handleConfirmYes}
        handleClickClose={handleConfirmClose}
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
          enableRowActions
          positionActionsColumn="first"
          enableEditing
          state={{
            isLoading: loading,
          }}
          initialState={{
            columnVisibility: { desc: false, owner: false, created: false },
            sorting: [{ id: 'updated', desc: true }],
          }}
          muiTablePaginationProps={{
            rowsPerPageOptions: [10, 20, 50, 100],
            labelRowsPerPage: 'projects per page',
          }}
          renderEmptyRowsFallback={() => (
            <center>
              <br></br>No projects to display
            </center>
          )}
          renderDetailPanel={({ row }) => (
            <div style={{ margin: '15px', textAlign: 'left' }}>
              <b>Description:</b> {row.original.desc}
              {(props.tableType === 'admin' || row.original.owner === user.profile.email) && (
                <>
                  <br></br>
                  <b>Shared To:</b> {row.original.sharedTo.join(', ')}
                </>
              )}
            </div>
          )}
          onEditingRowSave={handleSaveRowEdits}
          onEditingRowCancel={handleCancelRowEdits}
          renderRowActions={({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <Tooltip arrow placement="bottom" title="Go to project result page">
                <IconButton onClick={() => navigate(`${projectPageUrl}${row.original.code}`)}>
                  <Explore />
                </IconButton>
              </Tooltip>
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
                        className="edge-table-icon"
                        onClick={() => {
                          handleAction('refresh')
                          table.reset()
                        }}
                      />
                    </Fab>
                  </Tooltip>
                  <Tooltip title="Delete selected projects" aria-label="delete">
                    <Fab
                      color="primary"
                      size="small"
                      style={{ marginRight: 10 }}
                      aria-label="delete"
                    >
                      <Delete
                        className="edge-table-icon"
                        onClick={() => {
                          setTable(table)
                          handleAction('delete', table.getSelectedRowModel().flatRows)
                        }}
                      />
                    </Fab>
                  </Tooltip>
                  <Tooltip title="Share selected projects" aria-label="share">
                    <Fab
                      color="primary"
                      size="small"
                      style={{ marginRight: 10 }}
                      aria-label="share"
                    >
                      <PersonAdd
                        className="edge-table-icon"
                        onClick={() => {
                          setTable(table)
                          handleAction('share', table.getSelectedRowModel().flatRows)
                        }}
                      />
                    </Fab>
                  </Tooltip>
                  <Tooltip title="Unshare selected projects" aria-label="unshare">
                    <Fab
                      color="primary"
                      size="small"
                      style={{ marginRight: 10 }}
                      aria-label="unshare"
                    >
                      <PersonAddDisabled
                        className="edge-table-icon"
                        onClick={() => {
                          setTable(table)
                          handleAction('unshare', table.getSelectedRowModel().flatRows)
                        }}
                      />
                    </Fab>
                  </Tooltip>
                  <Tooltip title="Publish selected projects" aria-label="publish">
                    <Fab
                      color="primary"
                      size="small"
                      style={{ marginRight: 10 }}
                      aria-label="publish"
                    >
                      <LockOpen
                        className="edge-table-icon"
                        onClick={() => {
                          setTable(table)
                          handleAction('publish', table.getSelectedRowModel().flatRows)
                        }}
                      />
                    </Fab>
                  </Tooltip>
                  <Tooltip title="Unpublish selected projects" aria-label="unpublish">
                    <Fab
                      color="primary"
                      size="small"
                      style={{ marginRight: 10 }}
                      aria-label="unpublish"
                    >
                      <Lock
                        className="edge-table-icon"
                        onClick={() => {
                          setTable(table)
                          handleAction('unpublish', table.getSelectedRowModel().flatRows)
                        }}
                      />
                    </Fab>
                  </Tooltip>
                </div>
              </div>
            )
          }}
        />
      </ThemeProvider>
    </>
  )
}

export default SraDataTable
