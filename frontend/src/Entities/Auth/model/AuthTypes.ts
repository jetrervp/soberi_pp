export interface RegisterResponse {
  message: string
}

export interface ResendCodeResponse {
  message: string
}

export interface AuthResponse {
  accessToken: string
}

export interface ApiErrorResponse {
  statusCode: number
  message: string | string[]
  error?: string
}

export type LogoutResponse = true
