import { create } from 'zustand'
import { defaultTheme, themes, type AppTheme } from '../constants/themes'

const THEME_STORAGE_KEY = 'momento_theme'

type ThemeStore = {
  currentTheme: string
  theme: AppTheme
  setTheme: (themeKey: string) => void
}

function getInitialThemeKey() {
  if (typeof window === 'undefined') {
    return defaultTheme
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  return storedTheme && themes[storedTheme] ? storedTheme : defaultTheme
}

const initialTheme = getInitialThemeKey()

export const useThemeStore = create<ThemeStore>((set) => ({
  currentTheme: initialTheme,
  theme: themes[initialTheme],
  setTheme: (themeKey: string) => {
    const nextThemeKey = themes[themeKey] ? themeKey : defaultTheme

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextThemeKey)
    }

    set({
      currentTheme: nextThemeKey,
      theme: themes[nextThemeKey],
    })
  },
}))
