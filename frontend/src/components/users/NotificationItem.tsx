import { Bell, CheckCircle2, Heart, MessageCircle, Trash2, UserPlus } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import type { Notification } from '../../types/notification'

type NotificationItemProps = {
  notification: Notification
  timeLabel: string
  onMarkAsRead?: (id: string) => void
  onDelete?: (id: string) => void
}

const iconMap = {
  LIKE: Heart,
  COMMENT: MessageCircle,
  FOLLOW: UserPlus,
  PROVIDER_REQUEST_APPROVED: CheckCircle2,
  PROVIDER_REQUEST_REJECTED: Bell,
  REPORT_STATUS: Bell,
  SYSTEM: Bell,
}

export function NotificationItem({
  notification,
  timeLabel,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const Icon = iconMap[notification.type as keyof typeof iconMap] || Bell

  return (
    <Card
      className={`flex items-start gap-4 ${
        notification.isRead ? 'bg-white' : 'border-orange-200 bg-orange-50'
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
          notification.isRead
            ? 'bg-slate-100 text-slate-600'
            : 'bg-orange-500 text-white'
        }`}
      >
        <Icon size={22} />
      </div>

      <div className="flex-1">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
          <div>
            <h3 className="font-bold text-slate-950">{notification.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {notification.message}
            </p>
          </div>

          <span className="text-xs font-medium text-slate-400">
            {timeLabel}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {!notification.isRead ? (
            <Button
              variant="ghost"
              className="px-0 py-0 text-xs text-orange-700 hover:bg-transparent"
              onClick={() => onMarkAsRead?.(notification.id)}
            >
              Mark as read
            </Button>
          ) : (
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Read
            </span>
          )}

          <Button
            variant="ghost"
            className="px-0 py-0 text-xs text-slate-500 hover:bg-transparent"
            onClick={() => onDelete?.(notification.id)}
          >
            <Trash2 size={14} className="mr-1 inline" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  )
}
