import { createSlice, isAnyOf, type PayloadAction } from "@reduxjs/toolkit"
import { loginSucceeded, logoutSucceeded, restoreSession, verifySucceeded } from "../../Auth/model/AuthStore"
import type { Profile } from "./ProfileTypes"

interface ProfileState {
    profile: Profile | null
    error: string | null
}

const initialState: ProfileState = {
    profile: null,
    error: null
}

const ProfileStore = createSlice({
    name: "ProfileStore",
    initialState,
    reducers: {
        profileSucceeded(state, action: PayloadAction<Profile>) {
            state.profile = action.payload
            state.error = null
        },
        profileFailed(state, action: PayloadAction<string>) {
            state.error = action.payload
        }
    },
    extraReducers: builder => {
        builder.addMatcher(isAnyOf(loginSucceeded, logoutSucceeded, restoreSession, verifySucceeded), () => initialState)
    }
})

export const { profileSucceeded, profileFailed } = ProfileStore.actions
export default ProfileStore.reducer
