import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Col, Row } from 'reactstrap'
import { MaterialReactTable } from 'material-react-table'
import { ThemeProvider, MenuItem, Tooltip } from '@mui/material'
import Fab from '@mui/material/Fab'
import { Refresh, FileDownload, Forward } from '@mui/icons-material'
import moment from 'moment'
import ReactJson from 'react-json-view'
import { setSubmittingForm } from 'src/redux/reducers/pageSlice'
import { cleanError } from 'src/redux/reducers/messageSlice'
import { ConfirmDialog, LoaderDialog } from 'src/edge/common/Dialogs'
import { getData, postData } from 'src/edge/common/util'
import { theme, actionDialogMessages, submitSession } from './tableUtil'

const StructureTableAll = (props) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const [submitting, setSubmitting] = useState(false)
  const [table, setTable] = useState()
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedData, setSelectedData] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [action, setAction] = useState('')

  useEffect(() => {
    getStructures()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props, user])

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
    [],
  )

  const getStructures = () => {
    let url = props.api
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

  const handleAction = (action, rows) => {
    if (action === 'refresh') {
      getStructures()
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

    //get user selector options
    if (action === 'export-data') {
      //exportData(selectedRows)
    } else if (action === 'create-session') {
      // // store selectedData to localstorage
      // localStorage.setItem('structures', JSON.stringify(selectedData))
      // // redirect to /genomeBrowser page
      // navigate('/genomeBrowser')

      // call api to launch a trame instance and redirect to genomeBrowser
      let params = { structure: selectedData[0]['code'], app: 'default' }
      setSubmitting(true)
      submitSession(params)
        .then((data) => {
          setSubmitting(false)
          navigate('/trame', { state: { url: data.url } })
        })
        .catch((error) => {
          setSubmitting(false)
          alert(error)
        })
    }
  }

  return (
    <>
      <LoaderDialog loading={submitting === true} text="Loading ..." />
      <ConfirmDialog
        isOpen={openDialog}
        action={action}
        header={'Are you sure to ' + action + ' the selected structures?'}
        message={actionDialogMessages[action]}
        handleClickYes={handleConfirmYes}
        handleClickClose={handleConfirmClose}
      />
      <ThemeProvider theme={theme}>
        <MaterialReactTable
          columns={columns}
          data={tableData}
          enableFullScreenToggle={false}
          enableRowSelection
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
                &nbsp;
              </Col>
            </Row>
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
                  <Tooltip title="Export selected structures" aria-label="export-data">
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
                </div>
              </div>
            )
          }}
        />
      </ThemeProvider>
    </>
  )
}

export default StructureTableAll
