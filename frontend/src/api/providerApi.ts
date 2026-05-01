import { apiRequest } from './client'
import type {
  ProviderProfile,
  ProviderRequest,
  Service,
  ServiceReview,
} from '../types/provider'

type ProvidersResponse = {
  success: boolean
  message: string
  providers: ProviderProfile[]
}

type ProviderResponse = {
  success: boolean
  message: string
  provider: ProviderProfile
}

type ServicesResponse = {
  success: boolean
  message: string
  services: Service[]
}

type ServiceResponse = {
  success: boolean
  message: string
  service: Service
}

type ReviewsResponse = {
  success: boolean
  message: string
  reviews: ServiceReview[]
}

type ProviderRequestsResponse = {
  success: boolean
  message: string
  providerRequests: ProviderRequest[]
}

type ProviderRequestSubmissionResponse = {
  success: boolean
  message: string
  providerRequest: ProviderRequest
}

type CinUploadResponse = {
  success: boolean
  message: string
  cinPicturePath: string
}

type ProviderProfileResponse = {
  success: boolean
  message: string
  providerProfile: ProviderProfile
}

type ReviewResponse = {
  success: boolean
  message: string
  review: ServiceReview
}

type ServiceImagesResponse = {
  success: boolean
  message: string
  images: Array<{
    id: string
    serviceId: string
    imagePath: string
    createdAt: string
  }>
}

export function getProviders() {
  return apiRequest<ProvidersResponse>('/providers', { auth: false })
}

export function getProviderById(id: string) {
  return apiRequest<ProviderResponse>(`/providers/${id}`, { auth: false })
}

export function uploadCinPicture(file: File) {
  const formData = new FormData()
  formData.append('cinPicture', file)

  return apiRequest<CinUploadResponse>('/providers/requests/cin-picture', {
    method: 'POST',
    body: formData,
  })
}

export function submitProviderRequest(payload: {
  professionalName: string
  professionalDescription: string
  phone: string
  city: string
  cinNumber: string
  cinPicturePath: string
  additionalInfo?: string
}) {
  return apiRequest<ProviderRequestSubmissionResponse>(
    '/providers/requests',
    {
      method: 'POST',
      body: payload,
    },
  )
}

export function getMyProviderRequests() {
  return apiRequest<ProviderRequestsResponse>('/providers/requests/me')
}

export function getMyProviderProfile() {
  return apiRequest<ProviderProfileResponse>('/providers/me/profile')
}

export function updateMyProviderProfile(payload: Partial<{
  professionalName: string
  professionalDescription: string
  phone: string
  city: string
}>) {
  return apiRequest<ProviderProfileResponse>('/providers/me/profile', {
    method: 'PATCH',
    body: payload,
  })
}

export function getServices() {
  return apiRequest<ServicesResponse>('/providers/services', { auth: false })
}

export function getServiceById(id: string) {
  return apiRequest<ServiceResponse>(`/providers/services/${id}`, { auth: false })
}

export function getMyServices() {
  return apiRequest<ServicesResponse>('/providers/me/services')
}

export function createService(payload: {
  title: string
  description: string
  price?: number
  city: string
  category: string
}) {
  return apiRequest<ServiceResponse>('/providers/services', {
    method: 'POST',
    body: payload,
  })
}

export function updateService(id: string, payload: Partial<{
  title: string
  description: string
  price?: number
  city: string
  category: string
  status?: string
}>) {
  return apiRequest<ServiceResponse>(`/providers/services/${id}`, {
    method: 'PATCH',
    body: payload,
  })
}

export function deleteService(id: string) {
  return apiRequest<void>(`/providers/services/${id}`, {
    method: 'DELETE',
  })
}

export function getServiceReviews(serviceId: string) {
  return apiRequest<ReviewsResponse>(`/providers/services/${serviceId}/reviews`, { auth: false })
}

export function addServiceReview(serviceId: string, payload: {
  rating: number
  comment?: string
}) {
  return apiRequest<ReviewResponse>(`/providers/services/${serviceId}/reviews`, {
    method: 'POST',
    body: payload,
  })
}

export function updateServiceReview(reviewId: string, payload: Partial<{
  rating: number
  comment?: string
}>) {
  return apiRequest<ReviewResponse>(`/providers/reviews/${reviewId}`, {
    method: 'PATCH',
    body: payload,
  })
}

export function deleteServiceReview(reviewId: string) {
  return apiRequest<void>(`/providers/reviews/${reviewId}`, {
    method: 'DELETE',
  })
}

export function reportService(serviceId: string, reason: string, description?: string) {
  return apiRequest<{ success: boolean; message: string }>(`/providers/services/${serviceId}/reports`, {
    method: 'POST',
    body: { reason, description },
  })
}

export function uploadServiceImages(serviceId: string, files: File[]) {
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('images', file)
  })

  return apiRequest<ServiceImagesResponse>(`/providers/services/${serviceId}/images`, {
    method: 'POST',
    body: formData,
  })
}

export function deleteServiceImage(serviceId: string, imageId: string) {
  return apiRequest<{ success: boolean; message: string }>(
    `/providers/services/${serviceId}/images/${imageId}`,
    {
      method: 'DELETE',
    },
  )
}
