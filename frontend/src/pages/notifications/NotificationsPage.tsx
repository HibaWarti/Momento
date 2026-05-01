import { Bell, CheckCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { NotificationItem } from '../../components/users/NotificationItem'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../api/notificationApi'
import type { Notification } from '../../types/notification'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  )

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getNotifications()
      setNotifications(response.notifications)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadNotifications()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, isRead: true })),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notifications')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
      setNotifications((current) => current.filter((notification) => notification.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification')
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = Date.now()
    const diffInMinutes = Math.max(1, Math.floor((now - new Date(dateString).getTime()) / 60000))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
          <p className="mt-4 text-slate-600">Loading notifications...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <p className="text-lg text-red-600">{error}</p>
          <Button className="mt-4" onClick={() => void loadNotifications()}>
            Try again
          </Button>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge variant="orange">Notifications</Badge>
          <h1 className="mt-4 text-3xl font-bold text-slate-950">Your notifications</h1>
          <p className="mt-2 text-slate-600">
            Follow reactions, comments, provider updates, and system messages.
          </p>
        </div>

        <Button variant="outline" onClick={() => void handleMarkAllAsRead()}>
          <CheckCheck className="mr-2 inline" size={16} />
          Mark all as read
        </Button>
      </div>

      <Card className="mt-8 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <Bell size={24} />
          </div>

          <div>
            <p className="font-bold text-slate-950">{unreadCount} unread notifications</p>
            <p className="text-sm text-slate-500">Stay updated with your activity.</p>
          </div>
        </div>
      </Card>

      <div className="mt-6 space-y-4">
        {notifications.length === 0 ? (
          <Card className="text-center">
            <p className="text-slate-600">You do not have any notifications yet.</p>
          </Card>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              timeLabel={formatTimeAgo(notification.createdAt)}
              onMarkAsRead={(id) => void handleMarkAsRead(id)}
              onDelete={(id) => void handleDelete(id)}
            />
          ))
        )}
      </div>
    </main>
  )
}
