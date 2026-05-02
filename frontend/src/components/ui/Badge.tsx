import type { ReactNode } from 'react'

type BadgeVariant = 'orange' | 'purple' | 'pink' | 'green' | 'slate'

type BadgeProps = {
  children: ReactNode
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  orange: 'theme-badge-primary',
  purple: 'theme-badge-secondary',
  pink: 'theme-badge-accent',
  green: 'theme-badge-success',
  slate: 'theme-badge-muted',
}

export function Badge({ children, variant = 'orange' }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${variantClasses[variant]}`}
    >
      {children}
    </span>
  )
}
