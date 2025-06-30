export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  organization?: string
  is_active: boolean
  created_at: string
  updated_at: string
  notification_preferences?: NotificationPreferences
}

export type UserRole = "admin" | "geologist" | "analyst" | "viewer"

export interface NotificationPreferences {
  email: boolean
  slack: boolean
  sms: boolean
  webhook: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  organization?: string
}

export interface AuthResponse {
  access_token: string
  token_type: "bearer"
  user: User
}

export interface TokenPayload {
  sub: string
  exp: number
  iat: number
  role: UserRole
}
