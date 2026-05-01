import { apiRequest } from './client'
import type { Notification } from '../types/notification'

type NotificationsResponse = {
  success: boolean
  message: string
  notifications: Notification[]
}

type NotificationResponse = {
  success: boolean
  message: string
  notification: Notification
}

type UnreadCountResponse = {
  success: boolean
  unreadCount: number
}

export function getNotifications() {
  return apiRequest<NotificationsResponse>('/notifications')
}

export function getUnreadNotificationsCount() {
  return apiRequest<UnreadCountResponse>('/notifications/unread-count')
}

export function markNotificationAsRead(id: string) {
  return apiRequest<NotificationResponse>(`/notifications/${id}/read`, {
    method: 'PATCH',
  })
}

export function markAllNotificationsAsRead() {
  return apiRequest<{ success: boolean; message: string; updatedCount: number }>(
    '/notifications/read-all',
    {
      method: 'PATCH',
    },
  )
}

export function deleteNotification(id: string) {
  return apiRequest<{ success: boolean; message: string }>(`/notifications/${id}`, {
    method: 'DELETE',
  })
}
