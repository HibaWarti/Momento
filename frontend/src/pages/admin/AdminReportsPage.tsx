import { Eye, ShieldAlert, XCircle } from 'lucide-react'
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { mockReports } from '../../data/mockAdminModeration'

export function AdminReportsPage() {
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
                {mockReports.map((report) => (
                  <tr key={report.id} className="bg-white">
                    <td className="px-6 py-4 font-semibold text-slate-950">{report.type}</td>
                    <td className="px-6 py-4 text-slate-600">{report.reporter}</td>
                    <td className="px-6 py-4 text-slate-600">{report.target}</td>
                    <td className="px-6 py-4 text-slate-600">{report.reason}</td>
                    <td className="px-6 py-4">
                      <AdminStatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">
                          <Eye className="mr-2 inline" size={15} />
                          View
                        </Button>

                        <Button variant="secondary">
                          <ShieldAlert className="mr-2 inline" size={15} />
                          Resolve
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
              In the real backend, each moderation action should create a system log.
            </p>
          </Card>
        </aside>
      </div>
    </main>
  )
}