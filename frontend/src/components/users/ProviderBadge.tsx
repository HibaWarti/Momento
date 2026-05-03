import { BadgeCheck } from 'lucide-react'

type ProviderBadgeProps = {
  label?: string
  compact?: boolean
}

export function ProviderBadge({ label = 'Provider', compact = false }: ProviderBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 font-semibold text-emerald-700 ${
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
      title="Verified provider"
    >
      <BadgeCheck size={compact ? 12 : 14} />
      {label}
    </span>
  )
}
