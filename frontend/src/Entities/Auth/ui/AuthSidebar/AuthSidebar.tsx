import { type FC } from 'react'
import s from './AuthSidebar.module.scss'

const AuthSidebar: FC = () => {
    return <aside className={s.AuthSidebar}>
        <p className={s.AuthSidebar__brand}>Собери</p>
        <p className={s.AuthSidebar__headline}>Ваш магазин<br /> начинается здесь</p>
        <p className={s.AuthSidebar__description}>Создавайте и управляйте магазином с помощью ИИ.</p>
    </aside>
}

export default AuthSidebar
