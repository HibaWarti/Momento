import type { AuthUser } from './auth'

export type ProviderRequestStatus = 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED'
export type ProviderStatus = 'ACTIVE' | 'SUSPENDED'
export type ServiceStatus = 'ACTIVE' | 'HIDDEN' | 'DELETED'
export type ReviewStatus = 'VISIBLE' | 'HIDDEN'

export type ProviderRequest = {
  id: string
  userId: string
  professionalName: string
  professionalDescription: string
  phone: string
  city: string
  cinNumber: string
  cinPicturePath: string
  additionalInfo?: string | null
  status: ProviderRequestStatus
  submittedAt?: string
  reviewedAt?: string | null
  createdAt?: string
  updatedAt?: string
  user?: AuthUser
}

export type ProviderProfile = {
  id: string
  userId: string
  professionalName: string
  professionalDescription: string
  phone: string
  city: string
  providerStatus: ProviderStatus
  createdAt?: string
  updatedAt?: string
  user?: AuthUser
  services?: Service[]
  _count?: {
    services?: number
    reviews?: number
  }
}

export type ServiceImage = {
  id: string
  serviceId?: string
  imagePath?: string
  path?: string
  createdAt?: string
}

export type ServiceReview = {
  id: string
  serviceId: string
  userId: string
  rating: number
  comment?: string | null
  status: ReviewStatus
  createdAt: string
  updatedAt?: string
  user?: AuthUser
}

export type Service = {
  id: string
  providerProfileId: string
  title: string
  description: string
  price?: number | null
  city: string
  category: string
  status: ServiceStatus
  createdAt: string
  updatedAt?: string
  providerProfile?: ProviderProfile
  images?: ServiceImage[]
  reviews?: ServiceReview[]
  _count?: {
    reviews?: number
    reports?: number
  }
}
