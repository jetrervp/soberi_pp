import { instance } from "../../../App/AppApi"
import type { AuthResponse, LogoutResponse, RegisterResponse, ResendCodeResponse } from "../model/AuthTypes"



const AuthApi = {
    async login(email: string, password: string) {
        const data = await instance.post<AuthResponse>('/auth/login', { email, password })
        return data
    },
    async logout() {
        const data = await instance.post<LogoutResponse>('/auth/logout')
        return data
    },
    async regist(name: string, email: string, password: string){
        const data = await instance.post<RegisterResponse>('/auth/register', {name, email, password})
        return data
    },
    async verifyEmail(email: string, code: string){
        const data = await instance.post<AuthResponse>('/auth/verify-email', {email, code})
        return data
    },
    resendCode(email: string) {
        return instance.post<ResendCodeResponse>('/auth/resend-code', { email })
    },
    refresh() {
        return instance.post<AuthResponse>('/auth/refresh', undefined, { timeout: 10000 })
    },
}

export default AuthApi
