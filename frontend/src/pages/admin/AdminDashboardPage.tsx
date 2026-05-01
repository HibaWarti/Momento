import { AlertTriangle, ClipboardCheck, ShieldCheck, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminStatCard } from '../../components/admin/AdminStatCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  getAdminLogs,
  getAdminStats,
  getSuperAdminLogs,
  getSuperAdminStats,
} from '../../api/adminApi'
import { paths } from '../../routes/paths'
import { useAuthStore } from '../../store/authStore'
import type { AdminLog, AdminStats } from '../../types/admin'

export function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAdminDashboard = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [statsResponse, logsResponse] =
          user?.role === 'SUPERADMIN'
            ? await Promise.all([getSuperAdminStats(), getSuperAdminLogs()])
            : await Promise.all([getAdminStats(), getAdminLogs()])

        setStats(statsResponse.stats)
        setLogs(logsResponse.logs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    void loadAdminDashboard()
  }, [user?.role])

  const statCards = useMemo(
    () => [
      {
        label: 'Users',
        value: String(stats?.totalUsers ?? 0),
        change: `${stats?.activeUsers ?? 0} active`,
      },
      {
        label: 'Provider Requests',
        value: String(stats?.pendingProviderRequests ?? 0),
        change: 'Pending review',
      },
      {
        label: 'Reports',
        value: String(stats?.totalReports ?? 0),
        change: `${stats?.pendingReports ?? 0} pending`,
      },
      {
        label: 'Services',
        value: String(stats?.totalServices ?? 0),
        change: `${stats?.hiddenServices ?? 0} hidden`,
      },
    ],
    [stats],
  )

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-500"></div>
          <p className="mt-4 text-slate-600">Loading admin dashboard...</p>
        </div>
      </main>
    )
  }

  if (error || !stats) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <p className="text-lg text-red-600">{error || 'Failed to load dashboard'}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge variant="purple">{user?.role === 'SUPERADMIN' ? 'SuperAdmin' : 'Admin'}</Badge>
          <h1 className="mt-4 text-3xl font-bold text-slate-950">Admin dashboard</h1>
          <p className="mt-2 text-slate-600">
            Monitor users, provider requests, reports, and platform activity.
          </p>
        </div>

        <Button variant="outline" disabled>
          Export later
        </Button>
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-4">
        {statCards.map((stat) => (
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
              <Link to={paths.adminProviderRequests}>
                <Button className="w-full">Review provider requests</Button>
              </Link>
              <Link to={paths.adminReports}>
                <Button variant="outline" className="w-full">
                  Manage reports
                </Button>
              </Link>
              <Link to={paths.adminUsers}>
                <Button variant="outline" className="w-full">
                  View users
                </Button>
              </Link>
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
                <strong className="text-slate-950">{stats.pendingProviderRequests ?? 0}</strong>
              </div>

              <div className="flex justify-between">
                <span>Open reports</span>
                <strong className="text-slate-950">{stats.pendingReports ?? 0}</strong>
              </div>

              <div className="flex justify-between">
                <span>Blocked users</span>
                <strong className="text-slate-950">{stats.blockedUsers ?? 0}</strong>
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
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-semibold text-slate-950">{log.action}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {log.description || `${log.entityType || 'System'} updated`}
                  </p>
                </div>

                <span className="text-sm text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}

            {logs.length === 0 ? (
              <p className="text-sm text-slate-500">No recent admin logs found.</p>
            ) : null}
          </div>
        </Card>
      </section>
    </main>
  )
}
