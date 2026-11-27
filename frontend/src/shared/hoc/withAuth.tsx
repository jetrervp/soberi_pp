import type { ComponentType } from "react"
import { Navigate } from "react-router-dom"
import { useAppSelector } from "../../App/AppStore"

const withAuth = <Props extends object,>(Component: ComponentType<Props>, access: "private" | "guest" = "private") => {
    const WithAuth = (props: Props) => {
        const accessToken = useAppSelector(state => state.AuthStore.accessToken)

        if (access === "private" && !accessToken) return <Navigate to="/login" replace />
        if (access === "guest" && accessToken) return <Navigate to="/Dashboard" replace />

        return <Component {...props} />
    }

    return WithAuth
}

export default withAuth
