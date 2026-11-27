import { useEffect, useState, type FC } from 'react'
import s from './ConfirmEmailBlock.module.scss'
import AuthSidebar from '../AuthSidebar/AuthSidebar'
import { Input } from '../../../../widgets/UI'

interface IProps {
    confirm: (code: string) => void
    resend: () => void
    changeEmail: () => void
    email: string
    busy: boolean
    resending: boolean
    error: string | null
    codeResent: boolean
    resendAvailableAt: number
}

const ConfirmEmailBlock: FC<IProps> = ({ confirm, resend, changeEmail, email, busy, resending, error, codeResent, resendAvailableAt }) => {
    const [code, setCode] = useState<string>("")
    const [now, setNow] = useState(() => Date.now())
    const secondsLeft = Math.max(0, Math.ceil((resendAvailableAt - now) / 1000))

    useEffect(() => {
        let timer: number

        const updateTime = () => {
            const currentTime = Date.now()
            setNow(currentTime)
            if (currentTime < resendAvailableAt) timer = window.setTimeout(updateTime, 1000)
        }

        timer = window.setTimeout(updateTime, 0)
        return () => window.clearTimeout(timer)
    }, [resendAvailableAt])

    return <div className={s.ConfirmEmailBlock}>
        <AuthSidebar />

        <section className={s.ConfirmEmailBlock__panel}>
            <div className={s.ConfirmEmailBlock__content}>
                <h1 className={s.ConfirmEmailBlock__title}>Введите код</h1>
                <p className={s.ConfirmEmailBlock__description}>Введите код из письма на {email}.</p>

                <form className={s.ConfirmEmailBlock__form} onSubmit={event => {
                    event.preventDefault()
                    if (!busy && code.length === 6) confirm(code)
                }}>
                    <label className={s.ConfirmEmailBlock__field}>
                        Код из письма
                        <Input
                            name='code'
                            inputMode='numeric'
                            autoComplete='one-time-code'
                            value={code}
                            onChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                            placeholder='123456'
                            required
                        />
                    </label>

                    {error && <p role="alert">{error}</p>}
                    {codeResent && <p role="status">Новый код отправлен.</p>}
                    <div className={s.ConfirmEmailBlock__actions}>
                        <button className={s.ConfirmEmailBlock__btn} type='submit' disabled={busy || code.length !== 6}>
                            {busy && !resending ? 'Подтверждаем…' : 'Подтвердить почту'}
                        </button>
                        <button className={s.ConfirmEmailBlock__change} type="button" disabled={busy || secondsLeft > 0} onClick={resend}>
                            {resending ? 'Отправляем…' : secondsLeft > 0 ? `Отправить повторно через ${secondsLeft} сек.` : 'Отправить код повторно'}
                        </button>
                        <button className={s.ConfirmEmailBlock__change} type="button" disabled={busy} onClick={changeEmail}>
                            Изменить email
                        </button>
                    </div>
                </form>
            </div>
        </section>
    </div>
}

export default ConfirmEmailBlock
