import { useState, type FC } from "react"
import { useAppDispatch, useAppSelector } from "../App/AppStore"
import { ClearPendingEmailAction, ConfirmEmailBlock, RegistAction, RegistBlock, ResendCodeAction, VerifyEmailAction } from "../Entities/Auth"

const Regist: FC = () => {
    const dispatch = useAppDispatch()
    const { error, isRegistering, isVerifying, isResending, pendingEmail, resendAvailableAt } = useAppSelector(
        state => state.AuthStore
    )
    const [codeResent, setCodeResent] = useState(false)

    return pendingEmail
        ? <ConfirmEmailBlock
            email={pendingEmail}
            changeEmail={() => {
                setCodeResent(false)
                dispatch(ClearPendingEmailAction())
            }}
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
