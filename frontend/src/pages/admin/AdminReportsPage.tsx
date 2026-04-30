import { useEffect, useState } from 'react'
import { Eye, ShieldAlert, XCircle, AlertTriangle, EyeOff } from 'lucide-react'
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  getReports,
  markReportReviewing,
  resolveReport,
  rejectReport,
  hidePost,
  restorePost,
  hideService,
  restoreService,
} from '../../api/adminApi'
import type { AdminReport } from '../../types/admin'

export function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [detailReport, setDetailReport] = useState<AdminReport | null>(null)

  async function loadReports() {
    try {
      setLoading(true)
      setError(null)
      const res = await getReports()
      setReports(res.reports)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  async function handleReviewing(id: string) {
    try {
      setActionLoading(id)
      await markReportReviewing(id)
      await loadReports()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleResolve(id: string) {
    try {
      setActionLoading(id)
      await resolveReport(id)
      await loadReports()
      if (detailReport?.id === id) setDetailReport(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resolve report')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id: string) {
    try {
      setActionLoading(id)
      await rejectReport(id)
      await loadReports()
      if (detailReport?.id === id) setDetailReport(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject report')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleHidePost(id: string, reportId: string) {
    try {
      setActionLoading(reportId)
      await hidePost(id)
      await loadReports()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to hide post')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRestorePost(id: string, reportId: string) {
    try {
      setActionLoading(reportId)
      await restorePost(id)
      await loadReports()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to restore post')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleHideService(id: string, reportId: string) {
    try {
      setActionLoading(reportId)
      await hideService(id)
      await loadReports()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to hide service')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRestoreService(id: string, reportId: string) {
    try {
      setActionLoading(reportId)
      await restoreService(id)
      await loadReports()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to restore service')
    } finally {
      setActionLoading(null)
    }
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString()
  }

  function getReportType(report: AdminReport) {
    if (report.postId) return 'Post'
    if (report.serviceId) return 'Service'
    if (report.reportedUserId) return 'User'
    return 'Other'
  }

  function getReportTarget(report: AdminReport) {
    if (report.post) return report.post.content?.slice(0, 40) || `Post ${report.postId}`
    if (report.service) return report.service.title || `Service ${report.serviceId}`
    if (report.reportedUser) return `${report.reportedUser.firstName} ${report.reportedUser.lastName}`
    return '—'
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
            <p className="mt-4 text-slate-600">Loading reports...</p>
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
            <p className="mt-4 font-semibold text-slate-950">Failed to load reports</p>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <Button className="mt-4" onClick={loadReports}>Retry</Button>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <Badge variant="pink">Moderation</Badge>
        <h1 className="mt-4 text-3xl font-bold text-slate-950">Reports moderation</h1>
        <p className="mt-2 text-slate-600">
          Review reports submitted by users and take moderation actions when needed.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-bold text-slate-950">Reports list</h2>
            <p className="mt-1 text-sm text-slate-500">
              Reports can concern posts, services, or users.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Reporter</th>
                  <th className="px-6 py-4">Target</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No reports found.
                    </td>
                  </tr>
                )}
                {reports.map((report) => (
                  <tr key={report.id} className="bg-white">
                    <td className="px-6 py-4 font-semibold text-slate-950">
                      {getReportType(report)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {report.reporter
                        ? `${report.reporter.firstName} ${report.reporter.lastName}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {getReportTarget(report)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{report.reason}</td>
                    <td className="px-6 py-4">
                      <AdminStatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button
                          variant="outline"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => setDetailReport(report)}
                        >
                          <Eye className="mr-1 inline" size={13} />
                          View
                        </Button>

                        {report.status === 'PENDING' && (
                          <Button
                            variant="ghost"
                            className="px-3 py-1.5 text-xs"
                            disabled={actionLoading === report.id}
                            onClick={() => handleReviewing(report.id)}
                          >
                            Reviewing
                          </Button>
                        )}

                        {report.status !== 'RESOLVED' && (
                          <Button
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            disabled={actionLoading === report.id}
                            onClick={() => handleResolve(report.id)}
                          >
                            <ShieldAlert className="mr-1 inline" size={13} />
                            Resolve
                          </Button>
                        )}

                        {report.status !== 'REJECTED' && (
                          <Button
                            variant="outline"
                            className="px-3 py-1.5 text-xs"
                            disabled={actionLoading === report.id}
                            onClick={() => handleReject(report.id)}
                          >
                            <XCircle className="mr-1 inline" size={13} />
                            Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <aside className="space-y-6">
          <Card>
            <h2 className="font-bold text-slate-950">Moderation rules</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>Check report reason and target content carefully.</li>
              <li>Resolve reports when the content violates platform rules.</li>
              <li>Reject reports that are invalid or abusive.</li>
              <li>Block users only for repeated or serious violations.</li>
            </ul>
          </Card>

          <Card className="bg-orange-50">
            <p className="font-semibold text-orange-800">Important</p>
            <p className="mt-2 text-sm leading-6 text-orange-700">
              Each moderation action creates a system log. Use &quot;View&quot; to see full report details and hide/restore linked content.
            </p>
          </Card>
        </aside>
      </div>

      {detailReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="mx-4 max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-950">Report details</h2>
              <AdminStatusBadge status={detailReport.status} />
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p><strong>Type:</strong> {getReportType(detailReport)}</p>
              <p><strong>Reason:</strong> {detailReport.reason}</p>
              {detailReport.description && (
                <p><strong>Description:</strong> {detailReport.description}</p>
              )}
              <p><strong>Reporter:</strong> {detailReport.reporter ? `${detailReport.reporter.firstName} ${detailReport.reporter.lastName}` : '—'}</p>
              {detailReport.reportedUser && (
                <p><strong>Reported user:</strong> {detailReport.reportedUser.firstName} {detailReport.reportedUser.lastName} ({detailReport.reportedUser.email})</p>
              )}
              {detailReport.post && (
                <div>
                  <p><strong>Reported post:</strong></p>
                  <p className="mt-1 rounded-xl bg-slate-50 p-3 text-slate-700">{detailReport.post.content}</p>
                  <p className="mt-1 text-xs text-slate-400">Status: {detailReport.post.status}</p>
                </div>
              )}
              {detailReport.service && (
                <div>
                  <p><strong>Reported service:</strong></p>
                  <p className="mt-1 rounded-xl bg-slate-50 p-3 text-slate-700">{detailReport.service.title}</p>
                  <p className="mt-1 text-xs text-slate-400">Status: {detailReport.service.status}</p>
                </div>
              )}
              <p><strong>Created:</strong> {formatDate(detailReport.createdAt)}</p>
              {detailReport.reviewedAt && (
                <p><strong>Reviewed:</strong> {formatDate(detailReport.reviewedAt)}</p>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-xs font-semibold uppercase text-slate-400">Report actions</p>
              <div className="flex flex-wrap gap-2">
                {detailReport.status === 'PENDING' && (
                  <Button
                    variant="ghost"
                    className="px-3 py-1.5 text-xs"
                    disabled={actionLoading === detailReport.id}
                    onClick={() => handleReviewing(detailReport.id)}
                  >
                    Mark Reviewing
                  </Button>
                )}
                {detailReport.status !== 'RESOLVED' && (
                  <Button
                    variant="secondary"
                    className="px-3 py-1.5 text-xs"
                    disabled={actionLoading === detailReport.id}
                    onClick={() => handleResolve(detailReport.id)}
                  >
                    Resolve
                  </Button>
                )}
                {detailReport.status !== 'REJECTED' && (
                  <Button
                    variant="outline"
                    className="px-3 py-1.5 text-xs"
                    disabled={actionLoading === detailReport.id}
                    onClick={() => handleReject(detailReport.id)}
                  >
                    Reject
                  </Button>
                )}
              </div>

              {(detailReport.postId || detailReport.serviceId) && (
                <>
                  <p className="text-xs font-semibold uppercase text-slate-400">Content moderation</p>
                  <div className="flex flex-wrap gap-2">
                    {detailReport.postId && (
                      <>
                        {detailReport.post?.status !== 'HIDDEN' ? (
                          <Button
                            variant="ghost"
                            className="px-3 py-1.5 text-xs"
                            disabled={actionLoading === detailReport.id}
                            onClick={() => handleHidePost(detailReport.postId!, detailReport.id)}
                          >
                            <EyeOff className="mr-1 inline" size={13} />
                            Hide post
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            className="px-3 py-1.5 text-xs"
                            disabled={actionLoading === detailReport.id}
                            onClick={() => handleRestorePost(detailReport.postId!, detailReport.id)}
                          >
                            <Eye className="mr-1 inline" size={13} />
                            Restore post
                          </Button>
                        )}
                      </>
                    )}
                    {detailReport.serviceId && (
                      <>
                        {detailReport.service?.status !== 'HIDDEN' ? (
                          <Button
                            variant="ghost"
                            className="px-3 py-1.5 text-xs"
                            disabled={actionLoading === detailReport.id}
                            onClick={() => handleHideService(detailReport.serviceId!, detailReport.id)}
                          >
                            <EyeOff className="mr-1 inline" size={13} />
                            Hide service
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            className="px-3 py-1.5 text-xs"
                            disabled={actionLoading === detailReport.id}
                            onClick={() => handleRestoreService(detailReport.serviceId!, detailReport.id)}
                          >
                            <Eye className="mr-1 inline" size={13} />
                            Restore service
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="mt-6">
              <Button variant="ghost" onClick={() => setDetailReport(null)}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </main>
  )
}