import { create } from 'zustand'
import { clearStoredToken, getStoredToken, setStoredToken } from '../api/client'
import { getCurrentUser, loginUser, registerUser } from '../api/authApi'
import type { AuthUser, RegisterPayload } from '../types/auth'

type AuthStore = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  loadCurrentUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      const response = await loginUser({ email, password })
      setStoredToken(response.token)
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      })
      throw error
    }
  },

  register: async (payload: RegisterPayload) => {
    try {
      set({ isLoading: true, error: null })
      const response = await registerUser(payload)
      setStoredToken(response.token)
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      })
      throw error
    }
  },

  logout: () => {
    clearStoredToken()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  },

  loadCurrentUser: async () => {
    try {
      const token = getStoredToken()
      if (!token) {
        set({ isLoading: false, isAuthenticated: false, user: null, token: null })
        return
      }

      set({ isLoading: true, error: null })
      const user = await getCurrentUser()
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      clearStoredToken()
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load user',
      })
    }
  },

  clearError: () => set({ error: null }),
}))
