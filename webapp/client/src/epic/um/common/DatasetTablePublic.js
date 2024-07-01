import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Col, Row } from 'reactstrap'
import { MaterialReactTable } from 'material-react-table'
import { ThemeProvider, Tooltip } from '@mui/material'
import Fab from '@mui/material/Fab'
import { Refresh, FileDownload, Forward } from '@mui/icons-material'
import moment from 'moment'
import ReactJson from 'react-json-view'

import { setSubmittingForm } from 'src/redux/reducers/pageSlice'
import { cleanError } from 'src/redux/reducers/messageSlice'
import { ConfirmDialog, LoaderDialog } from 'src/edge/common/Dialogs'
import { getData, postData } from 'src/edge/common/util'
import { theme, actionDialogMessages } from './tableUtil'
import { datasetUrl } from '../../util'

const DatasetTableViewOnly = (props) => {
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
    getDatasets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props, user])

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
        header: 'Loaded',
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

  const getDatasets = () => {
    let url = props.api
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

  const handleAction = (action, rows) => {
    if (action === 'refresh') {
      getDatasets()
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

    //get user selector options
    if (action === 'export-data') {
      //exportData(selectedRows)
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
    }
  }

  return (
    <>
      <LoaderDialog loading={submitting === true} text="Loading ..." />
      <ConfirmDialog
        isOpen={openDialog}
        action={action}
        header={'Are you sure to ' + action + ' the selected datasets?'}
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

export default DatasetTableViewOnly
