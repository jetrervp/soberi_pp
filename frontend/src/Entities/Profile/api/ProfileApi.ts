import { instance } from "../../../App/AppApi"
import type { Profile } from "../model/ProfileTypes"

const ProfileApi = {
    getMe(accessToken: string) {
        return instance.get<Profile>("/auth/me", {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
    }
}

export default ProfileApi
