const TOKEN_KEY = 'momento_token'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

type ApiRequestOptions = {
  method?: string
  body?: unknown
  auth?: boolean
}

export type ApiUser = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  profilePicturePath?: string | null
  bio?: string | null
  role: 'USER' | 'PROVIDER' | 'ADMIN' | 'SUPERADMIN'
}

export type SupportTicket = {
  id: string
  subject: string
  description: string
  category: 'ACCOUNT' | 'TECHNICAL' | 'REPORT' | 'PROVIDER' | 'OTHER'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED'
  createdAt: string
  updatedAt: string
  messages?: Array<{
    id: string
    message: string
    isStaff: boolean
    createdAt: string
  }>
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = new Headers()

  headers.set('Content-Type', 'application/json')

  if (options.auth !== false && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'API request failed')
  }

  return data as T
}

export function getSupportTickets() {
  return apiRequest<{
    success: boolean
    message: string
    tickets: SupportTicket[]
  }>('/users/tickets')
}

export function createSupportTicket(payload: {
  subject: string
  description: string
  category: SupportTicket['category']
  priority: SupportTicket['priority']
}) {
  return apiRequest<{
    success: boolean
    message: string
    ticket: SupportTicket
  }>('/users/tickets', {
    method: 'POST',
    body: payload,
  })
}

export function loginUser(payload: { email: string; password: string }) {
  return apiRequest<{
    success: boolean
    message: string
    user: ApiUser
    token: string
  }>('/auth/login', {
    method: 'POST',
    auth: false,
    body: payload,
  }).then((response) => {
    localStorage.setItem(TOKEN_KEY, response.token)
    return response
  })
}

export function registerUser(payload: {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
}) {
  return apiRequest<{
    success: boolean
    message: string
    user: ApiUser
    token: string
  }>('/auth/register', {
    method: 'POST',
    auth: false,
    body: payload,
  }).then((response) => {
    localStorage.setItem(TOKEN_KEY, response.token)
    return response
  })
}

export function getCurrentUser() {
  return apiRequest<{
    success: boolean
    message: string
    user: ApiUser
  }>('/auth/me')
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}
