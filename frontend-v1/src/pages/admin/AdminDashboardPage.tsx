import { AlertTriangle, ClipboardCheck, ShieldCheck, Users } from 'lucide-react'
import { AdminStatCard } from '../../components/admin/AdminStatCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { mockAdminStats, mockRecentActivities } from '../../data/mockAdminStats'

export function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge variant="purple">Admin</Badge>
          <h1 className="mt-4 text-3xl font-bold text-slate-950">Admin dashboard</h1>
          <p className="mt-2 text-slate-600">
            Monitor users, provider requests, reports, and platform activity.
          </p>
        </div>

        <Button variant="outline">Export report</Button>
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-4">
        {mockAdminStats.map((stat) => (
          <AdminStatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <ClipboardCheck size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-950">Platform overview</h2>
              <p className="text-sm text-slate-500">Mock chart placeholder</p>
            </div>
          </div>

          <div className="mt-8 flex h-72 items-end gap-4 rounded-3xl bg-slate-50 p-6">
            {[45, 65, 40, 75, 55, 90, 70].map((height, index) => (
              <div key={index} className="flex flex-1 items-end">
                <div
                  className="w-full rounded-t-2xl bg-gradient-to-t from-orange-500 to-pink-400"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-green-600" size={22} />
              <h2 className="font-bold text-slate-950">Quick actions</h2>
            </div>

            <div className="mt-5 space-y-3">
              <Button className="w-full">Review provider requests</Button>
              <Button variant="outline" className="w-full">
                Manage reports
              </Button>
              <Button variant="outline" className="w-full">
                View users
              </Button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-orange-500" size={22} />
              <h2 className="font-bold text-slate-950">Moderation summary</h2>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Pending provider requests</span>
                <strong className="text-slate-950">14</strong>
              </div>

              <div className="flex justify-between">
                <span>Open reports</span>
                <strong className="text-slate-950">7</strong>
              </div>

              <div className="flex justify-between">
                <span>Blocked users</span>
                <strong className="text-slate-950">3</strong>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-8">
        <Card>
          <div className="flex items-center gap-3">
            <Users className="text-violet-600" size={22} />
            <h2 className="text-xl font-bold text-slate-950">Recent activity</h2>
          </div>

          <div className="mt-6 space-y-4">
            {mockRecentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-semibold text-slate-950">{activity.action}</p>
                  <p className="mt-1 text-sm text-slate-500">{activity.description}</p>
                </div>

                <span className="text-sm text-slate-400">{activity.timeAgo}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  )
}