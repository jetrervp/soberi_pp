import type { FC } from "react"
import { Outlet } from "react-router-dom"
import DashboardNavbar from "../../widgets/DashboardNavbar/DashboardNavbar"
import { useAppSelector } from "../AppStore"
import s from "./DashboardLayout.module.scss"

const DashboardLayout: FC = () => {
    const profile = useAppSelector(state => state.ProfileStore.profile)

    return <div className={s.DashboardLayout}>
        <DashboardNavbar name={profile?.name} email={profile?.email} />
        <main className={s.DashboardLayout__content}>
            <Outlet />
        </main>
    </div>
}

export default DashboardLayout
