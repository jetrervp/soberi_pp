import type { AppDispatch, RootState } from "../../../App/AppStore"
import ProfileApi from "../api/ProfileApi"
import { profileFailed, profileSucceeded } from "../model/ProfileStore"

export const GetProfileAction = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const { accessToken } = getState().AuthStore

    if (!accessToken) {
        dispatch(profileFailed("Войдите в аккаунт, чтобы получить профиль."))
        return
    }

    try {
        const { data } = await ProfileApi.getMe(accessToken)
        if (getState().AuthStore.accessToken === accessToken) dispatch(profileSucceeded(data))
    } catch {
        if (getState().AuthStore.accessToken === accessToken) {
            dispatch(profileFailed("Не удалось загрузить профиль."))
        }
    }
}
