export type UserRole = 'USER' | 'PROVIDER' | 'ADMIN' | 'SUPERADMIN'

export type AccountStatus = 'ACTIVE' | 'BLOCKED' | 'DELETED'

export type AuthUser = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  profilePicturePath?: string | null
  bio?: string | null
  role: UserRole
  accountStatus: AccountStatus
  createdAt?: string
  updatedAt?: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
}

export type AuthResponse = {
  success: boolean
  message: string
  token: string
  user: AuthUser
}

export type CurrentUserResponse = {
  success: boolean
  message: string
  user: AuthUser
}
