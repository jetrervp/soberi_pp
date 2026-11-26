import axios from "axios"
import type { AppDispatch, RootState } from "../../../App/AppStore"
import AuthApi from "../api/AuthApi"
import {
    loginFailed, loginStarted, loginSucceeded,
    logoutFailed, logoutStarted, logoutSucceeded,
    registerFailed, registerStarted, registerSucceeded,
    verifyFailed, verifyStarted, verifySucceeded,
    resendFailed, resendStarted, resendSucceeded,
    setPendingEmail, setResendAvailableAt,
} from "../model/AuthStore"
import type { ApiErrorResponse } from "../model/AuthTypes"

const pendingEmailKey = "pendingVerificationEmail"
const resendAvailableAtKey = "verificationResendAvailableAt"
const resendCooldown = 60

const errorMessages: Record<string, string> = {
    "otp is invalid.": "Неверный код подтверждения. Проверьте код и попробуйте ещё раз.",
    "otp has expired or does not exist.": "Срок действия кода истёк. Запросите новый код.",
    "maximum otp verification attempts exceeded.": "Слишком много неверных попыток. Запросите новый код.",
    "otp operations are temporarily locked for this target.": "Проверка кода временно заблокирована. Попробуйте позже.",
    "otp resend cooldown is active.": "Подождите минуту перед повторной отправкой кода.",
    "otp request rate limit exceeded.": "Слишком много запросов кода. Попробуйте через минуту.",
    "internal server error": "На сервере произошла ошибка. Попробуйте позже.",
}

function savePendingEmail(email: string | null, resendAvailableAt = 0) {
    try {
        if (email === null) {
            sessionStorage.removeItem(pendingEmailKey)
            sessionStorage.removeItem(resendAvailableAtKey)
        } else {
            sessionStorage.setItem(pendingEmailKey, email)
            sessionStorage.setItem(resendAvailableAtKey, String(resendAvailableAt))
        }
    } catch {
        return
    }
}

function startResendCooldown(email: string, dispatch: AppDispatch) {
    const resendAvailableAt = Date.now() + resendCooldown * 1000
    savePendingEmail(email, resendAvailableAt)
    dispatch(setPendingEmail(email))
    dispatch(setResendAvailableAt(resendAvailableAt))
}

export const RestorePendingEmailAction = () => (dispatch: AppDispatch) => {
    let email: string | null
    let resendAvailableAt: number
    try {
        email = sessionStorage.getItem(pendingEmailKey)
        resendAvailableAt = Number(sessionStorage.getItem(resendAvailableAtKey))
    } catch {
        return
    }
    dispatch(setPendingEmail(email))
    if (email && Number.isFinite(resendAvailableAt)) dispatch(setResendAvailableAt(resendAvailableAt))
}

function getErrorMessage(error: unknown, fallback: string) {
    if (!axios.isAxiosError<ApiErrorResponse>(error)) return fallback
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") return "Сервер долго отвечает. Попробуйте ещё раз."
    if (!error.response) return "Не удалось подключиться к серверу."
    if (error.response.status === 409) return "Аккаунт с такой почтой уже существует. Войдите в аккаунт."
    if (error.response.status >= 500) return "На сервере произошла ошибка. Попробуйте позже."

    const message = error.response.data?.message
    if (Array.isArray(message) && message.length > 0) {
        return message.map(text => errorMessages[text.trim().toLowerCase()] ?? text).join(". ")
    }
    if (typeof message === "string" && message.trim()) {
        return errorMessages[message.trim().toLowerCase()] ?? message
    }
    return fallback
}

export const RegistAction = (name: string, email: string, password: string) =>
    async (dispatch: AppDispatch) => {
        dispatch(registerStarted())
        try {
            await AuthApi.regist(name, email, password)
            startResendCooldown(email, dispatch)
            dispatch(registerSucceeded())
            return true
        } catch (error) {
            dispatch(registerFailed(getErrorMessage(error, "Не удалось зарегистрироваться.")))
            return false
        }
    }

export const VerifyEmailAction = (email: string, code: string) =>
    async (dispatch: AppDispatch) => {
        dispatch(verifyStarted())
        try {
            const { data } = await AuthApi.verifyEmail(email, code)
            savePendingEmail(null)
            dispatch(verifySucceeded(data.accessToken))
            dispatch(setPendingEmail(null))
        } catch (error) {
            dispatch(verifyFailed(getErrorMessage(error, "Не удалось подтвердить почту.")))
        }
    }

export const ResendCodeAction = (email: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const { pendingEmail, resendAvailableAt, isResending, isVerifying } = getState().AuthStore
    if (isResending || isVerifying || (pendingEmail === email && Date.now() < resendAvailableAt)) return false

    dispatch(resendStarted())
    startResendCooldown(email, dispatch)
    try {
        await AuthApi.resendCode(email)
        startResendCooldown(email, dispatch)
        dispatch(resendSucceeded())
        return true
    } catch (error) {
        dispatch(resendFailed(getErrorMessage(error, "Не удалось отправить код. Повторите попытку через минуту.")))
        return false
    }
}

export const LoginAction = (email: string, password: string) =>
    async (dispatch: AppDispatch) => {
        dispatch(loginStarted())
        try {
            const { data } = await AuthApi.login(email, password)
            savePendingEmail(null)
            dispatch(loginSucceeded(data.accessToken))
            return true
        } catch (error) {
            const message = getErrorMessage(error, "Не удалось войти в аккаунт.")
            dispatch(loginFailed(message))

            if (axios.isAxiosError(error) && error.response?.status === 401 &&
                message === "Почта не подтверждена. Код подтверждения отправлен повторно.") {
                startResendCooldown(email, dispatch)
                return "verify-email"
            }

            return false
        }
    }

export const LogoutAction = () => async (dispatch: AppDispatch) => {
    dispatch(logoutStarted())
    try {
        await AuthApi.logout()
        savePendingEmail(null)
        dispatch(logoutSucceeded())
    } catch (error) {
        dispatch(logoutFailed(getErrorMessage(error, "Не удалось выйти из аккаунта.")))
    }
}
