import { useState, type FC } from "react"
import { Navigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../App/AppStore"
import { ConfirmEmailBlock, RegistAction, RegistBlock, ResendCodeAction, VerifyEmailAction } from "../Entities/Auth"

const Regist: FC = () => {
    const dispatch = useAppDispatch()
    const { accessToken, error, isRegistering, isVerifying, isResending, pendingEmail, resendAvailableAt } = useAppSelector(
        state => state.AuthStore
    )
    const [codeResent, setCodeResent] = useState(false)

    if (accessToken) return <Navigate to="/" replace />

    return pendingEmail
        ? <ConfirmEmailBlock
            email={pendingEmail}
            error={error}
            busy={isVerifying || isResending}
            resending={isResending}
            codeResent={codeResent}
            resendAvailableAt={resendAvailableAt}
            confirm={async code => {
                setCodeResent(false)
                await dispatch(VerifyEmailAction(pendingEmail, code))
            }}
            resend={async () => {
                setCodeResent(false)
                setCodeResent(await dispatch(ResendCodeAction(pendingEmail)))
            }}
        />
        : <RegistBlock
            error={error}
            busy={isRegistering}
            regist={async (email, name, password) => {
                await dispatch(RegistAction(name.trim(), email.trim(), password))
            }}
        />
}

export default Regist
