import { useState, type FC } from 'react'
import s from './RegistBlock.module.scss'
import { NavLink } from 'react-router-dom'
import { Input } from '../../../../widgets/UI'
import AuthSidebar from '../AuthSidebar/AuthSidebar'

interface IProps {
    regist: (email: string, name: string, password: string) => void
    busy: boolean
    error: string | null
}

const RegistBlock: FC<IProps> = ({ regist, busy, error }) => {
    const [email, setEmail] = useState<string>("")
    const [name, setName] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    return <div className={s.RegistBlock}>
        <AuthSidebar />

        <section className={s.RegistBlock__panel}>
            <div className={s.RegistBlock__content}>
                <h1 className={s.RegistBlock__title}>Создайте аккаунт</h1>
                <p className={s.RegistBlock__description}>Зарегистрируйтесь, чтобы собрать свой первый магазин.</p>

                <form className={s.RegistBlock__form} onSubmit={event => {
                    event.preventDefault()
                    if (!busy) regist(email, name, password)
                }}>
                    <label className={s.RegistBlock__field}>
                        Имя
                        <Input name='name' autoComplete='name' value={name} onChange={(v: string) => setName(v)} placeholder='Как к вам обращаться' required />
                    </label>
                    <label className={s.RegistBlock__field}>
                        Электронная почта
                        <Input name='email' type='email' autoComplete='email' value={email} onChange={(v: string) => setEmail(v)} placeholder='name@example.com' required />
                    </label>
                    <label className={s.RegistBlock__field}>
                        Пароль
                        <Input name='password' type='password' autoComplete='new-password' value={password} onChange={(v: string) => setPassword(v)} placeholder='Минимум 8 символов' minLength={8} required />
                    </label>
                    {error && <p role="alert">{error}</p>}
                    <button type="submit" className={s.RegistBlock__btn} disabled={busy || !name.trim() || !email.trim() || password.length < 8}>
                        Зарегистрироваться
                    </button>
                </form>

                <p className={s.RegistBlock__account}>
                    Уже есть аккаунт? <NavLink className={s.RegistBlock__link} to={'/login'}>Войти</NavLink>
                </p>
            </div>
        </section>
    </div>
}

export default RegistBlock
