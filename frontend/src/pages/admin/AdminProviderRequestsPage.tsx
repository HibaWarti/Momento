import { useEffect, useState } from 'react'
import { CheckCircle2, Eye, XCircle, AlertTriangle } from 'lucide-react'
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  getProviderRequests,
  markProviderRequestReviewing,
  approveProviderRequest,
  rejectProviderRequest,
} from '../../api/adminApi'
import type { ProviderRequest } from '../../types/provider'

export function AdminProviderRequestsPage() {
  const [requests, setRequests] = useState<ProviderRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [detailRequest, setDetailRequest] = useState<ProviderRequest | null>(null)

  async function loadRequests() {
    try {
      setLoading(true)
      setError(null)
      const res = await getProviderRequests()
      setRequests(res.requests)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provider requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function handleReviewing(id: string) {
    try {
      setActionLoading(id)
      await markProviderRequestReviewing(id)
      await loadRequests()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleApprove(id: string) {
    try {
      setActionLoading(id)
      await approveProviderRequest(id)
      await loadRequests()
      if (detailRequest?.id === id) setDetailRequest(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve request')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id: string) {
    const reason = prompt('Reason for rejection (optional):')
    try {
      setActionLoading(id)
      await rejectProviderRequest(id, reason || undefined)
      await loadRequests()
      if (detailRequest?.id === id) setDetailRequest(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject request')
    } finally {
      setActionLoading(null)
    }
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString()
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
            <p className="mt-4 text-slate-600">Loading provider requests...</p>
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
            <p className="mt-4 font-semibold text-slate-950">Failed to load provider requests</p>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <Button className="mt-4" onClick={loadRequests}>Retry</Button>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <Badge variant="purple">Admin</Badge>
        <h1 className="mt-4 text-3xl font-bold text-slate-950">Provider requests</h1>
        <p className="mt-2 text-slate-600">
          Review users who want to become providers and publish services.
        </p>
      </div>

      <Card className="mt-8 overflow-hidden p-0">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-bold text-slate-950">Requests list</h2>
          <p className="mt-1 text-sm text-slate-500">
            Approve or reject provider requests after checking their information.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Professional name</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No provider requests found.
                  </td>
                </tr>
              )}
              {requests.map((request) => (
                <tr key={request.id} className="bg-white">
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    {request.professionalName}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {request.user
                      ? `${request.user.firstName} ${request.user.lastName}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{request.city}</td>
                  <td className="px-6 py-4 text-slate-600">{request.phone}</td>
                  <td className="px-6 py-4">
                    <AdminStatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {formatDate(request.createdAt || request.submittedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="px-3 py-1.5 text-xs"
                        onClick={() => setDetailRequest(request)}
                      >
                        <Eye className="mr-2 inline" size={15} />
                        View
                      </Button>

                      {request.status === 'PENDING' && (
                        <Button
                          variant="ghost"
                          className="px-3 py-1.5 text-xs"
                          disabled={actionLoading === request.id}
                          onClick={() => handleReviewing(request.id)}
                        >
                          Reviewing
                        </Button>
                      )}

                      {request.status !== 'APPROVED' && (
                        <Button
                          variant="secondary"
                          className="px-3 py-1.5 text-xs"
                          disabled={actionLoading === request.id}
                          onClick={() => handleApprove(request.id)}
                        >
                          <CheckCircle2 className="mr-2 inline" size={15} />
                          Approve
                        </Button>
                      )}

                      {request.status !== 'REJECTED' && (
                        <Button
                          variant="outline"
                          className="px-3 py-1.5 text-xs"
                          disabled={actionLoading === request.id}
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="mr-2 inline" size={15} />
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

      {detailRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="mx-4 max-w-lg">
            <h2 className="text-xl font-bold text-slate-950">
              {detailRequest.professionalName}
            </h2>
            <AdminStatusBadge status={detailRequest.status} />

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p><strong>User:</strong> {detailRequest.user ? `${detailRequest.user.firstName} ${detailRequest.user.lastName}` : '—'}</p>
              <p><strong>Email:</strong> {detailRequest.user?.email || '—'}</p>
              <p><strong>City:</strong> {detailRequest.city}</p>
              <p><strong>Phone:</strong> {detailRequest.phone}</p>
              <p><strong>CIN:</strong> {detailRequest.cinNumber}</p>
              <p><strong>Description:</strong> {detailRequest.professionalDescription}</p>
              {detailRequest.additionalInfo && (
                <p><strong>Additional info:</strong> {detailRequest.additionalInfo}</p>
              )}
              <p><strong>Submitted:</strong> {formatDate(detailRequest.createdAt || detailRequest.submittedAt)}</p>
              {detailRequest.reviewedAt && (
                <p><strong>Reviewed:</strong> {formatDate(detailRequest.reviewedAt)}</p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {detailRequest.status === 'PENDING' && (
                <Button
                  variant="ghost"
                  disabled={actionLoading === detailRequest.id}
                  onClick={() => handleReviewing(detailRequest.id)}
                >
                  Mark Reviewing
                </Button>
              )}
              {detailRequest.status !== 'APPROVED' && (
                <Button
                  variant="secondary"
                  disabled={actionLoading === detailRequest.id}
                  onClick={() => handleApprove(detailRequest.id)}
                >
                  Approve
                </Button>
              )}
              {detailRequest.status !== 'REJECTED' && (
                <Button
                  variant="outline"
                  disabled={actionLoading === detailRequest.id}
                  onClick={() => handleReject(detailRequest.id)}
                >
                  Reject
                </Button>
              )}
              <Button variant="ghost" onClick={() => setDetailRequest(null)}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </main>
  )
}