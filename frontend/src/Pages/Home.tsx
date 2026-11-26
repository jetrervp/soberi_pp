import type { FC } from "react"
import { Navigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../App/AppStore"
import { LogoutAction } from "../Entities/Auth"



const Home: FC = () => {
    const dispatch = useAppDispatch()
    const { accessToken, error, isLoggingOut } = useAppSelector(state => state.AuthStore)

    if (!accessToken) return <Navigate to="/login" replace />

    return <div>
        <h1>Home</h1>
        <button type="button" disabled={isLoggingOut} onClick={() => dispatch(LogoutAction())}>
            {isLoggingOut ? 'Выходим…' : 'Выйти'}
        </button>
        {error && <p role="alert">{error}</p>}
    </div>
}

export default Home
