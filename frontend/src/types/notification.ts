export type NotificationType =
  | 'LIKE'
  | 'COMMENT'
  | 'FOLLOW'
  | 'PROVIDER_REQUEST_APPROVED'
  | 'PROVIDER_REQUEST_REJECTED'
  | 'REPORT_STATUS'
  | 'SYSTEM'

export type Notification = {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
}
