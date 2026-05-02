export type ThemeColors = {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  card: string
  border: string
  muted: string
  success: string
  warning: string
  error: string
}

export type AppTheme = {
  name: string
  colors: ThemeColors
}

export const themes: Record<string, AppTheme> = {
  light: {
    name: 'Light',
    colors: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      accent: '#ec4899',
      background: '#f8fafc',
      foreground: '#0f172a',
      card: '#ffffff',
      border: '#e2e8f0',
      muted: '#64748b',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#a78bfa',
      accent: '#f472b6',
      background: '#0f172a',
      foreground: '#f8fafc',
      card: '#1e293b',
      border: '#334155',
      muted: '#94a3b8',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
    },
  },
  purple: {
    name: 'Purple',
    colors: {
      primary: '#8b5cf6',
      secondary: '#6366f1',
      accent: '#d946ef',
      background: '#f5f3ff',
      foreground: '#1e1b4b',
      card: '#ffffff',
      border: '#ddd6fe',
      muted: '#7c3aed',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
  blue: {
    name: 'Blue',
    colors: {
      primary: '#0ea5e9',
      secondary: '#2563eb',
      accent: '#06b6d4',
      background: '#f0f9ff',
      foreground: '#0c4a6e',
      card: '#ffffff',
      border: '#bae6fd',
      muted: '#0284c7',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
  green: {
    name: 'Green',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#14b8a6',
      background: '#ecfdf5',
      foreground: '#064e3b',
      card: '#ffffff',
      border: '#a7f3d0',
      muted: '#047857',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
}

export const defaultTheme = 'light'
