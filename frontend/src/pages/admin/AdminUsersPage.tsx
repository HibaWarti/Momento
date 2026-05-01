import { Eye, Lock, Unlock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { blockUser, getUserById, getUsers, unblockUser } from '../../api/adminApi'
import type { AdminUser } from '../../types/user'

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getUsers()
      setUsers(response.users)
      setSelectedUser((current) =>
        current ? response.users.find((user) => user.id === current.id) ?? null : null,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const handleSelectUser = async (id: string) => {
    try {
      const response = await getUserById(id)
      setSelectedUser(response.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user details')
    }
  }

  const handleToggleBlock = async (user: AdminUser) => {
    try {
      setActionId(user.id)
      const response =
        user.accountStatus === 'BLOCKED'
          ? await unblockUser(user.id)
          : await blockUser(user.id)

      setUsers((current) =>
        current.map((item) => (item.id === user.id ? response.user : item)),
      )
      setSelectedUser((current) => (current?.id === user.id ? response.user : current))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status')
    } finally {
      setActionId(null)
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
          <p className="mt-4 text-slate-600">Loading users...</p>
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
          Review user accounts and block or unblock accounts when needed.
        </p>
      </div>

      {error && (
        <Card className="mt-8 border border-red-100 bg-red-50 text-red-700">{error}</Card>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-bold text-slate-950">Users list</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Posts</th>
                  <th className="px-6 py-4">Followers</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="bg-white">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-950">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-slate-500">@{user.username}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.role}</td>
                    <td className="px-6 py-4 text-slate-600">{user.accountStatus}</td>
                    <td className="px-6 py-4 text-slate-600">{user._count?.posts ?? 0}</td>
                    <td className="px-6 py-4 text-slate-600">{user._count?.followers ?? 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => void handleSelectUser(user.id)}>
                          <Eye className="mr-2 inline" size={15} />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => void handleToggleBlock(user)}
                          disabled={actionId === user.id}
                        >
                          {user.accountStatus === 'BLOCKED' ? (
                            <>
                              <Unlock className="mr-2 inline" size={15} />
                              Unblock
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 inline" size={15} />
                              Block
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <aside>
          <Card>
            <h2 className="font-bold text-slate-950">User details</h2>

            {selectedUser ? (
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>
                  <strong className="text-slate-950">Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong className="text-slate-950">Role:</strong> {selectedUser.role}
                </p>
                <p>
                  <strong className="text-slate-950">Status:</strong> {selectedUser.accountStatus}
                </p>
                <p>
                  <strong className="text-slate-950">Bio:</strong>{' '}
                  {selectedUser.bio || 'No bio provided'}
                </p>
                <p>
                  <strong className="text-slate-950">Provider requests:</strong>{' '}
                  {selectedUser._count?.providerRequests ?? 0}
                </p>
                <p>
                  <strong className="text-slate-950">Following:</strong>{' '}
                  {selectedUser._count?.following ?? 0}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Select a user to inspect the account.</p>
            )}
          </Card>
        </aside>
      </div>
    </main>
  )
}
