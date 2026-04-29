import { Bell, CheckCheck } from 'lucide-react'
import { NotificationItem } from '../../components/users/NotificationItem'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { mockNotifications } from '../../data/mockNotifications'

export function NotificationsPage() {
  const unreadCount = mockNotifications.filter((notification) => !notification.isRead).length

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

        <Button variant="outline">
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
        {mockNotifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </main>
  )
}