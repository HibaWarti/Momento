import { apiRequest } from './client'
import type { PublicUserProfile, UserSummary } from '../types/user'

type MyProfileResponse = {
  success: boolean
  message: string
  user: PublicUserProfile
}

type PublicProfileResponse = {
  success: boolean
  message: string
  user: PublicUserProfile
}

type UserListResponse = {
  success: boolean
  message: string
  count: number
  followers?: UserSummary[]
  following?: UserSummary[]
}

export function getMyProfile() {
  return apiRequest<MyProfileResponse>('/users/profile/me')
}

export function updateMyProfile(payload: Partial<{
  firstName: string
  lastName: string
  username: string
  bio: string | null
}>) {
  return apiRequest<MyProfileResponse>('/users/profile/me', {
    method: 'PATCH',
    body: payload,
  })
}

export function uploadProfilePicture(file: File) {
  const formData = new FormData()
  formData.append('profilePicture', file)

  return apiRequest<MyProfileResponse>('/users/profile/me/picture', {
    method: 'PATCH',
    body: formData,
  })
}

export function getUserById(id: string) {
  return apiRequest<PublicProfileResponse>(`/users/${id}`, { auth: false })
}

export function followUser(id: string) {
  return apiRequest<{ success: boolean; message: string }>(`/users/${id}/follow`, {
    method: 'POST',
  })
}

export function unfollowUser(id: string) {
  return apiRequest<{ success: boolean; message: string }>(`/users/${id}/follow`, {
    method: 'DELETE',
  })
}

export async function getFollowers(id: string) {
  const response = await apiRequest<UserListResponse>(`/users/${id}/followers`, {
    auth: false,
  })

  return {
    ...response,
    users: response.followers ?? [],
  }
}

export async function getFollowing(id: string) {
  const response = await apiRequest<UserListResponse>(`/users/${id}/following`, {
    auth: false,
  })

  return {
    ...response,
    users: response.following ?? [],
  }
}

export function reportUser(id: string, reason: string, description?: string) {
  return apiRequest<{ success: boolean; message: string }>(`/users/${id}/reports`, {
    method: 'POST',
    body: { reason, description },
  })
}
