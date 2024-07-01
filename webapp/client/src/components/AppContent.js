import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import { Row, Col } from 'reactstrap'

// routes config
import routes from '../routes'
import privateRoutes from '../private-routes'
import PrivateRoute from '../edge/common/PrivateRoute'

const AppContent = () => {
  return (
    <Row className="justify-content-center">
      <Col xs="12" md="12">
        <Suspense fallback={<CSpinner color="primary" />}>
          <Routes>
            {routes.map((route, idx) => {
              return (
                route.element && (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    element={<route.element />}
                  />
                )
              )
            })}
            {privateRoutes.map((route, idx) => {
              return (
                route.element && (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    element={
                      <PrivateRoute>
                        <route.element />
                      </PrivateRoute>
                    }
                  />
                )
              )
            })}

            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </Suspense>
      </Col>
    </Row>
  )
}

export default React.memo(AppContent)
