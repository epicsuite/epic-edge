import React, { useState, useEffect, useMemo } from 'react'
import moment from 'moment'
import { MaterialReactTable } from 'material-react-table'
import { Badge, Row, Col } from 'reactstrap'
import { ThemeProvider } from '@mui/material'
import { theme, projectStatusColors, projectStatusNames } from 'src/edge/um/common/tableUtil'
import { getData, apis } from 'src/edge/common/util'
import { workflowList } from 'src/util'
import { SideMenu } from 'src/components/SideMenu'

const JobQueue = () => {
  //should be memoized or stable
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name', //access nested data with dot notation
        header: 'project',
      },
      {
        accessorKey: 'owner',
        header: 'Owner',
      },
      {
        accessorKey: 'type', //normal accessorKey
        header: 'Type',
        Cell: ({ cell }) => <>{workflowList[cell.getValue()].label}</>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        Cell: ({ cell }) => (
          <Badge color={projectStatusColors[cell.getValue()]}>
            {projectStatusNames[cell.getValue()]}
          </Badge>
        ),
        size: 100, //decrease the width of this column
      },
      {
        accessorKey: 'created',
        header: 'Created',
        Cell: ({ cell }) => <>{moment(cell.getValue()).format('MM/DD/YYYY, h:mm:ss A')}</>,
      },
      {
        accessorKey: 'updated',
        header: 'Updated',
        Cell: ({ cell }) => <>{moment(cell.getValue()).format('MM/DD/YYYY, h:mm:ss A')}</>,
      },
    ],
    [],
  )

  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getProjects = () => {
      setLoading(true)
      getData(apis.jobQueue)
        .then((data) => {
          setTableData(data.projects)
          setLoading(false)
        })
        .catch((err) => {
          setLoading(false)
          alert(err)
        })
    }
    //refresh table every 30 seconds
    getProjects()
    const timer = setInterval(() => {
      getProjects()
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <Row className="justify-content-center">
        <Col xs="12" sm="12" md="2">
          <SideMenu />
        </Col>
        <Col xs="12" sm="12" md="10">
          <Row className="justify-content-center">
            <Col xs="12" sm="12" md="10">
              <ThemeProvider theme={theme}>
                <MaterialReactTable
                  columns={columns}
                  data={tableData}
                  enableFullScreenToggle={false}
                  enableColumnActions={false}
                  enableSorting={false}
                  enableColumnFilters={false}
                  state={{
                    isLoading: loading,
                  }}
                  renderEmptyRowsFallback={() => (
                    <center>
                      <br></br>No jobs to display
                    </center>
                  )}
                  renderTopToolbarCustomActions={({ table }) => {
                    return <div className="edge-table-title">Job Queue</div>
                  }}
                />
              </ThemeProvider>
            </Col>
            <Col xs="12" sm="12" md="2"></Col>
          </Row>
        </Col>
      </Row>
    </>
  )
}

export default JobQueue
