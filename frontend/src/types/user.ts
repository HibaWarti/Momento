import type { AuthUser } from './auth'

export type UserSummary = Pick<
  AuthUser,
  'id' | 'firstName' | 'lastName' | 'username' | 'profilePicturePath' | 'bio' | 'role'
>

export type PublicUserProfile = AuthUser & {
  _count?: {
    posts?: number
    followers?: number
    following?: number
    providerRequests?: number
  }
}

export type AdminUser = AuthUser & {
  providerProfile?: {
    id: string
    professionalName: string
    professionalDescription: string
    phone: string
    city: string
    providerStatus: string
  } | null
  providerRequests?: Array<{
    id: string
    status: string
    professionalName: string
    submittedAt?: string
    reviewedAt?: string | null
  }>
  _count?: {
    posts?: number
    followers?: number
    following?: number
    providerRequests?: number
  }
}
