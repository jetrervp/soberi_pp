import type { FC } from "react"
import { Route, Routes } from "react-router-dom"
import { routes } from "."




const AppRoutes: FC = () => {
    return <Routes>
        {routes.map(route => <Route key={route.path} path={route.path} element={<route.element/>}/>)}
    </Routes>
}

export default AppRoutes
