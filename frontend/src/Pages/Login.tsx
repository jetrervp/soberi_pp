import type { FC } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../App/AppStore"
import { LoginAction, LoginBlock } from "../Entities/Auth"

const Login: FC = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { error, isLoggingIn } = useAppSelector(state => state.AuthStore)

    return <LoginBlock
        error={error}
        busy={isLoggingIn}
        login={async (email, password) => {
            const result = await dispatch(LoginAction(email.trim(), password))
            if (result === "verify-email") navigate('/Regist', { replace: true })
        }}
    />
}

export default Login
