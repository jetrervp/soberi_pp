import type { FC } from "react"
import { Route, Routes } from "react-router-dom"
import withAuth from "../../shared/hoc/withAuth"
import DashboardLayout from "../layouts/DashboardLayout"
import { dashboardRoutes, routes } from "."

const ProtectedDashboardLayout = withAuth(DashboardLayout)

const AppRoutes: FC = () => {
    return <Routes>
        {routes.map(route => <Route key={route.path} path={route.path} element={<route.element/>}/>)}
        <Route element={<ProtectedDashboardLayout />}>
            {dashboardRoutes.map(route => <Route
                key={route.path}
                path={route.path}
                element={<route.element />}
            />)}
        </Route>
    </Routes>
}

export default AppRoutes
