type AdminStatusBadgeProps = {
  status: string
}

const statusClasses: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-700',
  REVIEWING: 'bg-violet-100 text-violet-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  RESOLVED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-green-100 text-green-700',
  BLOCKED: 'bg-red-100 text-red-700',
  USER: 'bg-slate-100 text-slate-700',
  PROVIDER: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-violet-100 text-violet-700',
  SUPERADMIN: 'bg-purple-100 text-purple-700',
  HIDDEN: 'bg-slate-100 text-slate-500',
  DELETED: 'bg-slate-100 text-slate-400',
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