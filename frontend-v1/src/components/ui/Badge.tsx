import type { ReactNode } from 'react'

type BadgeVariant = 'orange' | 'purple' | 'pink' | 'green' | 'slate'

type BadgeProps = {
  children: ReactNode
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  orange: 'bg-orange-100 text-orange-700',
  purple: 'bg-violet-100 text-violet-700',
  pink: 'bg-pink-100 text-pink-700',
  green: 'bg-green-100 text-green-700',
  slate: 'bg-slate-100 text-slate-700',
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