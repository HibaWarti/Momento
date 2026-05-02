import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--theme-primary)] text-white hover:opacity-90',
  secondary: 'bg-[var(--theme-secondary)] text-white hover:opacity-90',
  outline:
    'border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-foreground)] hover:border-[var(--theme-primary)]',
  ghost: 'text-[var(--theme-foreground)] hover:bg-[var(--theme-card)]',
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
