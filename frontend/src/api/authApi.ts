import { apiRequest } from './client'
import type {
  AuthResponse,
  AuthUser,
  CurrentUserResponse,
  LoginPayload,
  RegisterPayload,
} from '../types/auth'

export function loginUser(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<CurrentUserResponse>('/auth/me')
  return response.user
}
