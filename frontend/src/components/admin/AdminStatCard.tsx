import { Card } from '../ui/Card'

type AdminStatCardProps = {
  stat: {
    label: string
    value: string
    change: string
  }
}

export function AdminStatCard({ stat }: AdminStatCardProps) {
  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{stat.label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-950">{stat.value}</p>
      <p className="mt-2 text-sm font-semibold text-orange-600">{stat.change}</p>
    </Card>
  )
}