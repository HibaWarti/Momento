import { Bell, CheckCircle2, Heart, MessageCircle, UserPlus } from 'lucide-react'
import { Card } from '../ui/Card'

type NotificationItemProps = {
  notification: {
    id: string
    type: string
    title: string
    message: string
    timeAgo: string
    isRead: boolean
  }
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

export function NotificationItem({ notification }: NotificationItemProps) {
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
            {notification.timeAgo}
          </span>
        </div>

        {!notification.isRead && (
          <span className="mt-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            New
          </span>
        )}
      </div>
    </Card>
  )
}