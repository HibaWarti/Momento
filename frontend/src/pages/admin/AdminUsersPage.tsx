import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge'
import { getUsers, blockUser, unblockUser } from '../../api/adminApi'
import type { AuthUser } from '../../types/auth'

export function AdminUsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function loadUsers() {
    try {
      setLoading(true)
      setError(null)
      const res = await getUsers()
      setUsers(res.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleBlock(id: string) {
    try {
      setActionLoading(id)
      await blockUser(id)
      await loadUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to block user')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUnblock(id: string) {
    try {
      setActionLoading(id)
      await unblockUser(id)
      await loadUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to unblock user')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
            <p className="mt-4 text-slate-600">Loading users...</p>
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
            <p className="mt-4 font-semibold text-slate-950">Failed to load users</p>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <Button className="mt-4" onClick={loadUsers}>Retry</Button>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <Badge variant="purple">Admin</Badge>
        <h1 className="mt-4 text-3xl font-bold text-slate-950">Users management</h1>
        <p className="mt-2 text-slate-600">
          View and manage platform users, block or unblock accounts.
        </p>
      </div>

      <Card className="mt-8 overflow-hidden p-0">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-bold text-slate-950">Users list</h2>
          <p className="mt-1 text-sm text-slate-500">
            {users.length} user{users.length !== 1 ? 's' : ''} registered
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="bg-white">
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 text-slate-600">{user.username}</td>
                  <td className="px-6 py-4">
                    <AdminStatusBadge status={user.role} />
                  </td>
                  <td className="px-6 py-4">
                    <AdminStatusBadge status={user.accountStatus} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {user.accountStatus === 'BLOCKED' ? (
                        <Button
                          variant="outline"
                          className="px-3 py-1.5 text-xs"
                          disabled={actionLoading === user.id}
                          onClick={() => handleUnblock(user.id)}
                        >
                          Unblock
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="px-3 py-1.5 text-xs"
                          disabled={actionLoading === user.id}
                          onClick={() => handleBlock(user.id)}
                        >
                          Block
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
    </main>
  )
}
