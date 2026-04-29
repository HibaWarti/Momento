import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}