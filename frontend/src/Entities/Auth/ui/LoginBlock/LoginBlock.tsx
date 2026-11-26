import { useState, type FC } from 'react'
import s from './LoginBlock.module.scss'
import AuthSidebar from '../AuthSidebar/AuthSidebar'
import { Input } from '../../../../widgets/UI'
import { NavLink } from 'react-router-dom'

interface IProps {
    login: (email: string, password: string) => void
    busy: boolean
    error: string | null
}

const LoginBlock: FC<IProps> = ({ login, busy, error }) => {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    return <div className={s.LoginBlock}>
        <AuthSidebar />

        <section className={s.LoginBlock__panel}>
            <div className={s.LoginBlock__content}>
                <h1 className={s.LoginBlock__title}>Вход в аккаунт</h1>
                <p className={s.LoginBlock__description}>Войдите, чтобы продолжить работу с магазином.</p>

                <form className={s.LoginBlock__form} onSubmit={(event) => {
                    event.preventDefault()
                    if (!busy) login(email, password)
                }}>
                    <label className={s.LoginBlock__field}>
                        Электронная почта
                        <Input name='email' type='email' autoComplete='email' value={email} onChange={setEmail} placeholder='name@example.com' required />
                    </label>
                    <label className={s.LoginBlock__field}>
                        Пароль
                        <Input name='password' type='password' autoComplete='current-password' value={password} onChange={setPassword} required />
                    </label>
                    {error && <p role="alert">{error}</p>}
                    <button className={s.LoginBlock__btn} type='submit' disabled={busy || !email.trim() || !password}>
                        {busy ? 'Входим…' : 'Войти'}
                    </button>
                </form>

                <p className={s.LoginBlock__account}>
                    Нет аккаунта? <NavLink className={s.LoginBlock__link} to='/Regist'>Зарегистрироваться</NavLink>
                </p>
            </div>
        </section>
    </div>
}

export default LoginBlock
