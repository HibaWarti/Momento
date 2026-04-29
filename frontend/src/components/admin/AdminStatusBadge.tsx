type AdminStatusBadgeProps = {
  status: string
}

const statusClasses: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-700',
  REVIEWING: 'bg-violet-100 text-violet-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  RESOLVED: 'bg-green-100 text-green-700',
}

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusClasses[status] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {status}
    </span>
  )
}