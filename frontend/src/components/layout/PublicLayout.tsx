import { Outlet } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { Navbar } from './Navbar'
import { useThemeStore } from '../../store/themeStore'

export function PublicLayout() {
  const theme = useThemeStore((state) => state.theme)
  const colors = theme.colors

  return (
    <div
      className="min-h-screen text-[var(--theme-foreground)]"
      style={
        {
          '--theme-primary': colors.primary,
          '--theme-secondary': colors.secondary,
          '--theme-accent': colors.accent,
          '--theme-background': colors.background,
          '--theme-foreground': colors.foreground,
          '--theme-card': colors.card,
          '--theme-border': colors.border,
          '--theme-muted': colors.muted,
          '--theme-success': colors.success,
          '--theme-warning': colors.warning,
          '--theme-error': colors.error,
          backgroundColor: colors.background,
          backgroundImage: `radial-gradient(${colors.primary}12 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        } as CSSProperties
      }
    >
      <Navbar />
      <Outlet />
    </div>
  )
}
