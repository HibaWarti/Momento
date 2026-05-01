import { CheckCircle2, Eye, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  approveProviderRequest,
  getProviderRequests,
  markProviderRequestReviewing,
  rejectProviderRequest,
} from '../../api/adminApi'
import { getAssetUrl } from '../../api/client'
import type { ProviderRequest } from '../../types/provider'

export function AdminProviderRequestsPage() {
  const [requests, setRequests] = useState<ProviderRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ProviderRequest | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  const loadRequests = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getProviderRequests()
      setRequests(response.providerRequests)
      setSelectedRequest((current) =>
        current
          ? response.providerRequests.find((request) => request.id === current.id) ?? null
          : null,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provider requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadRequests()
  }, [])

  const handleReviewing = async (id: string) => {
    try {
      setActionId(id)
      const response = await markProviderRequestReviewing(id)
      setRequests((current) =>
        current.map((request) =>
          request.id === id ? response.providerRequest : request,
        ),
      )
      setSelectedRequest((current) =>
        current?.id === id ? response.providerRequest : current,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request')
    } finally {
      setActionId(null)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      setActionId(id)
      const response = await approveProviderRequest(id)
      setRequests((current) =>
        current.map((request) =>
          request.id === id ? response.providerRequest : request,
        ),
      )
      setSelectedRequest((current) =>
        current?.id === id ? response.providerRequest : current,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request')
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Optional rejection reason')

    try {
      setActionId(id)
      const response = await rejectProviderRequest(id, reason || undefined)
      setRequests((current) =>
        current.map((request) =>
          request.id === id ? response.providerRequest : request,
        ),
      )
      setSelectedRequest((current) =>
        current?.id === id ? response.providerRequest : current,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request')
    } finally {
      setActionId(null)
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-500"></div>
          <p className="mt-4 text-slate-600">Loading provider requests...</p>
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

      {error && (
        <Card className="mt-8 border border-red-100 bg-red-50 text-red-700">{error}</Card>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
      <Card className="overflow-hidden p-0">
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
              {requests.map((request) => (
                <tr key={request.id} className="bg-white">
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    {request.professionalName}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {request.user?.firstName} {request.user?.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{request.city}</td>
                  <td className="px-6 py-4 text-slate-600">{request.phone}</td>
                  <td className="px-6 py-4">
                    <AdminStatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {request.submittedAt
                      ? new Date(request.submittedAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="mr-2 inline" size={15} />
                        View
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => void handleReviewing(request.id)}
                        disabled={actionId === request.id}
                      >
                        Review
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => void handleApprove(request.id)}
                        disabled={actionId === request.id}
                      >
                        <CheckCircle2 className="mr-2 inline" size={15} />
                        Approve
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => void handleReject(request.id)}
                        disabled={actionId === request.id}
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
          <h2 className="font-bold text-slate-950">Request details</h2>

          {selectedRequest ? (
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                <strong className="text-slate-950">Professional name:</strong>{' '}
                {selectedRequest.professionalName}
              </p>
              <p>
                <strong className="text-slate-950">Username:</strong>{' '}
                @{selectedRequest.user?.username}
              </p>
              <p>
                <strong className="text-slate-950">Description:</strong>{' '}
                {selectedRequest.professionalDescription}
              </p>
              <p>
                <strong className="text-slate-950">Phone:</strong> {selectedRequest.phone}
              </p>
              <p>
                <strong className="text-slate-950">City:</strong> {selectedRequest.city}
              </p>
              <p>
                <strong className="text-slate-950">CIN number:</strong> {selectedRequest.cinNumber}
              </p>
              <p>
                <strong className="text-slate-950">Additional info:</strong>{' '}
                {selectedRequest.additionalInfo || 'No additional info'}
              </p>
              {selectedRequest.cinPicturePath ? (
                <a
                  href={getAssetUrl(selectedRequest.cinPicturePath) || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-orange-600"
                >
                  Open CIN picture
                </a>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Choose a request to inspect its details.
            </p>
          )}
        </Card>
      </aside>
      </div>
    </main>
  )
}
