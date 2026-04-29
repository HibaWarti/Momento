import { CheckCircle2, Eye, XCircle } from 'lucide-react'
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { mockProviderRequests } from '../../data/mockAdminModeration'

export function AdminProviderRequestsPage() {
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
              {mockProviderRequests.map((request) => (
                <tr key={request.id} className="bg-white">
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    {request.professionalName}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{request.userName}</td>
                  <td className="px-6 py-4 text-slate-600">{request.city}</td>
                  <td className="px-6 py-4 text-slate-600">{request.phone}</td>
                  <td className="px-6 py-4">
                    <AdminStatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-500">{request.submittedAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">
                        <Eye className="mr-2 inline" size={15} />
                        View
                      </Button>

                      <Button variant="secondary">
                        <CheckCircle2 className="mr-2 inline" size={15} />
                        Approve
                      </Button>

                      <Button variant="outline">
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
    </main>
  )
}