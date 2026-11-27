import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface IinitialState {
    isLoggingIn: boolean,
    isLoggingOut: boolean,
    isRegistering: boolean,
    error: string | null,
    accessToken: string | null,
    isVerifying: boolean,
    isResending: boolean,
    pendingEmail: string | null,
    resendAvailableAt: number,
}

const initialState: IinitialState = {
    isLoggingIn: false,
    isLoggingOut: false,
    isRegistering: false,
    isVerifying: false,
    isResending: false,
    error: null,
    accessToken: null,
    pendingEmail: null,
    resendAvailableAt: 0,
}


const AuthStore = createSlice({
    name: "AuthStore",
    initialState,
    reducers: {
        loginStarted(state) {
            state.isLoggingIn = true
            state.error = null
        },
        loginSucceeded(state, action: PayloadAction<string>) {
            state.isLoggingIn = false
            state.accessToken = action.payload
            state.pendingEmail = null
            state.resendAvailableAt = 0
        },
        loginFailed(state, action: PayloadAction<string>) {
            state.isLoggingIn = false
            state.error = action.payload
        },

        logoutStarted(state) {
            state.isLoggingOut = true
            state.error = null
        },
        logoutSucceeded() {
            return initialState
        },
        logoutFailed(state, action: PayloadAction<string>) {
            state.isLoggingOut = false
            state.error = action.payload
        },

        setPendingEmail(state, action: PayloadAction<string | null>) {
            state.pendingEmail = action.payload
            if (action.payload === null) {
                state.resendAvailableAt = 0
                state.error = null
            }
        },
        setResendAvailableAt(state, action: PayloadAction<number>) {
            state.resendAvailableAt = action.payload
        },
        
        registerStarted(state) {
            state.isRegistering = true
            state.error = null
        },
        registerSucceeded(state) {
            state.isRegistering = false
        },
        registerFailed(state, action: PayloadAction<string>) {
            state.isRegistering = false
            state.error = action.payload
        },

        verifyStarted(state) {
            state.isVerifying = true
            state.error = null
        },
        verifySucceeded(state, action: PayloadAction<string>) {
            state.isVerifying = false
            state.accessToken = action.payload
        },
        verifyFailed(state, action: PayloadAction<string>) {
            state.isVerifying = false
            state.error = action.payload
        },

        resendStarted(state) {
            state.isResending = true
            state.error = null
        },
        resendSucceeded(state) {
            state.isResending = false
        },
        resendFailed(state, action: PayloadAction<string>) {
            state.isResending = false
            state.error = action.payload
        },
        restoreSession(state, action: PayloadAction<string>) {
            state.accessToken = action.payload
        },

    }
})

export default AuthStore.reducer
export const { registerStarted, registerSucceeded, registerFailed,
    loginStarted, loginSucceeded, loginFailed,
    logoutStarted, logoutSucceeded, logoutFailed,
    verifyStarted, verifySucceeded, verifyFailed,
    resendStarted, resendSucceeded, resendFailed, restoreSession, setPendingEmail, setResendAvailableAt
} = AuthStore.actions
