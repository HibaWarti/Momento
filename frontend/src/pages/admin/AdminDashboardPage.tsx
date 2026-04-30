import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ClipboardCheck, ShieldCheck, Users } from 'lucide-react'
import { AdminStatCard } from '../../components/admin/AdminStatCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { getAdminStats, getAdminLogs } from '../../api/adminApi'
import type { AdminStats, AdminLog } from '../../types/admin'
import { paths } from '../../routes/paths'

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [statsRes, logsRes] = await Promise.all([
          getAdminStats(),
          getAdminLogs(),
        ])
        setStats(statsRes.stats)
        setLogs(logsRes.logs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total users', value: String(stats?.totalUsers ?? '—'), change: `${stats?.activeUsers ?? 0} active` },
    { label: 'Active providers', value: String(stats?.activeProviders ?? '—'), change: `${stats?.pendingProviderRequests ?? 0} pending` },
    { label: 'Pending requests', value: String(stats?.pendingProviderRequests ?? '—'), change: 'Needs review' },
    { label: 'Open reports', value: String(stats?.pendingReports ?? '—'), change: `${stats?.resolvedReports ?? 0} resolved` },
  ]

  function formatTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
            <p className="mt-4 text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <Card className="max-w-md text-center">
            <AlertTriangle className="mx-auto text-orange-500" size={32} />
            <p className="mt-4 font-semibold text-slate-950">Failed to load dashboard</p>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Card>
        </div>
      </main>
    )
  }

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

        <Button variant="outline" disabled>Export report</Button>
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
              <p className="text-sm text-slate-500">Summary of platform metrics</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">{stats?.totalPosts ?? 0}</p>
              <p className="text-sm text-slate-500">Posts</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">{stats?.totalServices ?? 0}</p>
              <p className="text-sm text-slate-500">Services</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">{stats?.totalReviews ?? 0}</p>
              <p className="text-sm text-slate-500">Reviews</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">{stats?.hiddenPosts ?? 0}</p>
              <p className="text-sm text-slate-500">Hidden posts</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">{stats?.hiddenServices ?? 0}</p>
              <p className="text-sm text-slate-500">Hidden services</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">{stats?.blockedUsers ?? 0}</p>
              <p className="text-sm text-slate-500">Blocked users</p>
            </div>
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
                <strong className="text-slate-950">{stats?.pendingProviderRequests ?? 0}</strong>
              </div>

              <div className="flex justify-between">
                <span>Open reports</span>
                <strong className="text-slate-950">{stats?.pendingReports ?? 0}</strong>
              </div>

              <div className="flex justify-between">
                <span>Blocked users</span>
                <strong className="text-slate-950">{stats?.blockedUsers ?? 0}</strong>
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
            {logs.length === 0 && (
              <p className="text-sm text-slate-500">No recent activity logged.</p>
            )}
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-semibold text-slate-950">{log.action}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {log.description || `${log.entityType || ''} ${log.entityId || ''}`.trim() || '—'}
                  </p>
                </div>

                <span className="text-sm text-slate-400">{formatTimeAgo(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  )
}