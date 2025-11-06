import React from 'react'
import { Badge, Row, Col } from 'reactstrap'
import UserTable from 'src/edge/um/admin/UserTable'

const Users = (props) => {
  return (
    <div className="animated fadeIn">
      <Row className="justify-content-center">
        <Col xs="12" sm="12" md="1"></Col>
        <Col xs="12" sm="12" md="10">
          <div className="clearfix">
            <Badge color="danger" pill>
              Admin tool
            </Badge>
          </div>
        </Col>
        <Col xs="12" sm="12" md="1"></Col>
      </Row>
      <br></br>
      <Row className="justify-content-center">
        <Col xs="12" sm="12" md="1"></Col>
        <Col xs="12" sm="12" md="10">
          <UserTable title={'Manage Users'} {...props} />
        </Col>
        <Col xs="12" sm="12" md="1"></Col>
      </Row>
      <br></br>
    </div>
  )
}

export default Users
