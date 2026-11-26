import type { FC } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../App/AppStore"
import { LoginAction, LoginBlock } from "../Entities/Auth"

const Login: FC = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { accessToken, error, isLoggingIn } = useAppSelector(state => state.AuthStore)

    if (accessToken) return <Navigate to="/" replace />

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
