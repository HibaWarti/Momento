const TOKEN_KEY = 'momento_token'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}

type ApiRequestOptions = {
  method?: string
  body?: unknown
  headers?: HeadersInit
  auth?: boolean
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const token = getStoredToken()
  const headers = new Headers(options.headers)

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth !== false && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body:
      options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'API request failed')
  }

  return data as T
}
