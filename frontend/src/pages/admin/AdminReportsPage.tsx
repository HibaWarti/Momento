import { Eye, ShieldAlert, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  blockUser,
  getReports,
  hidePost,
  hideService,
  markReportReviewing,
  rejectReport,
  resolveReport,
  restorePost,
  restoreService,
} from '../../api/adminApi'
import type { AdminReport } from '../../types/admin'

export function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([])
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  const loadReports = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getReports()
      setReports(response.reports)
      setSelectedReport((current) =>
        current ? response.reports.find((report) => report.id === current.id) ?? null : null,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadReports()
  }, [])

  const replaceReport = (updatedReport: AdminReport) => {
    setReports((current) =>
      current.map((report) => (report.id === updatedReport.id ? updatedReport : report)),
    )
    setSelectedReport((current) => (current?.id === updatedReport.id ? updatedReport : current))
  }

  const handleReviewing = async (id: string) => {
    try {
      setActionId(id)
      const response = await markReportReviewing(id)
      replaceReport(response.report)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report')
    } finally {
      setActionId(null)
    }
  }

  const handleResolve = async (id: string) => {
    try {
      setActionId(id)
      const response = await resolveReport(id)
      replaceReport(response.report)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve report')
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (id: string) => {
    try {
      setActionId(id)
      const response = await rejectReport(id)
      replaceReport(response.report)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject report')
    } finally {
      setActionId(null)
    }
  }

  const handleModerationAction = async (report: AdminReport) => {
    try {
      setActionId(report.id)

      if (report.postId && report.post) {
        if (report.post.status === 'HIDDEN') {
          await restorePost(report.postId)
        } else {
          await hidePost(report.postId)
        }
      } else if (report.serviceId && report.service) {
        if (report.service.status === 'HIDDEN') {
          await restoreService(report.serviceId)
        } else {
          await hideService(report.serviceId)
        }
      } else if (report.reportedUserId) {
        await blockUser(report.reportedUserId)
      }

      await loadReports()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to moderate report target')
    } finally {
      setActionId(null)
    }
  }

  const getReportType = (report: AdminReport) => {
    if (report.postId) return 'POST'
    if (report.serviceId) return 'SERVICE'
    if (report.reportedUserId) return 'USER'
    return 'UNKNOWN'
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500"></div>
          <p className="mt-4 text-slate-600">Loading reports...</p>
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

      {error && (
        <Card className="mt-8 border border-red-100 bg-red-50 text-red-700">{error}</Card>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-bold text-slate-950">Reports list</h2>
            <p className="mt-1 text-sm text-slate-500">
              Reports can concern posts or users.
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
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="bg-white">
                    <td className="px-6 py-4 font-semibold text-slate-950">
                      {getReportType(report)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {report.reporter?.firstName} {report.reporter?.lastName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {report.reportedUser
                        ? `${report.reportedUser.firstName} ${report.reportedUser.lastName}`
                        : report.post
                          ? report.post.content.slice(0, 24)
                          : report.service
                            ? report.service.title
                            : 'Unknown target'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{report.reason}</td>
                    <td className="px-6 py-4">
                      <AdminStatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setSelectedReport(report)}>
                          <Eye className="mr-2 inline" size={15} />
                          View
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => void handleReviewing(report.id)}
                          disabled={actionId === report.id}
                        >
                          Review
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={() => void handleResolve(report.id)}
                          disabled={actionId === report.id}
                        >
                          <ShieldAlert className="mr-2 inline" size={15} />
                          Resolve
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => void handleReject(report.id)}
                          disabled={actionId === report.id}
                        >
                          <XCircle className="mr-2 inline" size={15} />
                          Reject
                        </Button>
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
            <h2 className="font-bold text-slate-950">Report details</h2>

            {selectedReport ? (
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>
                  <strong className="text-slate-950">Reason:</strong> {selectedReport.reason}
                </p>
                <p>
                  <strong className="text-slate-950">Description:</strong>{' '}
                  {selectedReport.description || 'No additional description'}
                </p>
                <p>
                  <strong className="text-slate-950">Reporter:</strong>{' '}
                  {selectedReport.reporter?.username}
                </p>
                <p>
                  <strong className="text-slate-950">Status:</strong> {selectedReport.status}
                </p>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => void handleModerationAction(selectedReport)}
                  disabled={actionId === selectedReport.id}
                >
                  {selectedReport.post
                    ? selectedReport.post.status === 'HIDDEN'
                      ? 'Restore post'
                      : 'Hide post'
                    : selectedReport.service
                      ? selectedReport.service.status === 'HIDDEN'
                        ? 'Restore service'
                        : 'Hide service'
                      : selectedReport.reportedUser
                        ? 'Block user'
                        : 'No moderation action'}
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Choose a report to inspect it.</p>
            )}
          </Card>

          <Card className="bg-orange-50">
            <p className="font-semibold text-orange-800">Important</p>
            <p className="mt-2 text-sm leading-6 text-orange-700">
              In the real backend, each moderation action should create a system log.
            </p>
          </Card>
        </aside>
      </div>
    </main>
  )
}
