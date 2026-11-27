export interface Profile {
    id: string
    name: string
    email: string
    emailVerified: boolean
    role: "ADMIN" | "USER"
    createdAt: string
}
