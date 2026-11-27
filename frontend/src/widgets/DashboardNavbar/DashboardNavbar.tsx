import type { FC } from "react"
import { NavLink } from "react-router-dom"
import { RoutesNames } from "../../App/Routes"
import s from "./DashboardNavbar.module.scss"

const linkClassName = ({ isActive }: { isActive: boolean }) => isActive
    ? `${s.Navbar__link} ${s.Navbar__link_active}`
    : s.Navbar__link

interface IProps {
    name?: string
    email?: string
}

const DashboardNavbar: FC<IProps> = ({ name, email }) => {
    return <aside className={s.Navbar}>
        <p className={s.Navbar__brand}>Собери</p>

        <nav className={s.Navbar__links} aria-label="Разделы CRM">
            <NavLink to={RoutesNames.Dashboard} end className={linkClassName}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z" />
                </svg>
                Обзор
            </NavLink>  
            <NavLink to={RoutesNames.MyShops} className={linkClassName}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 10v11h16V10 M3 10l2-6h14l2 6H3z M10 21v-6h4v6" />
                </svg>
                Мои магазины
            </NavLink>
            <NavLink to={RoutesNames.Orders} end className={linkClassName}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 5H4v16h16V5h-2 M8 3h8v4H8z M8 12h8 M8 16h8" />
                </svg>
                Заказы
            </NavLink>
            <NavLink to={RoutesNames.Stat} end className={linkClassName}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 3v18h18 M8 17v-4 M13 17V9 M18 17V5" />
                </svg>
                Статистика
            </NavLink>
        </nav>

        {name && email && <div className={s.Navbar__profile}>
            <img className={s.Navbar__avatar}
                src={`/avatar-placeholder.svg`}
                width="40" height="40" alt="" />
            <div>
                <p className={s.Navbar__name}>{name}</p>
                <p className={s.Navbar__email}>{email}</p>
            </div>
        </div>}
    </aside>
}

export default DashboardNavbar
