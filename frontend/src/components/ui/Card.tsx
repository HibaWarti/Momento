import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
