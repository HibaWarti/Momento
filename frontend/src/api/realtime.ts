import { io, type Socket } from 'socket.io-client'
import { API_ORIGIN, getStoredToken } from './client'

export type RealtimeUser = {
  id: string
  firstName: string
  lastName: string
  username: string
  profilePicturePath?: string | null
}

export type RealtimeChatMessage = {
  id: string
  conversationId: string
  senderId: string
  content: string
  isRead: boolean
  createdAt: string
  updatedAt: string
  sender?: RealtimeUser
}

export type RealtimeConversation = {
  id: string
  createdAt: string
  updatedAt: string
  unreadCount?: number
  participants?: Array<{
    userId: string
    user?: RealtimeUser
  }>
  messages?: RealtimeChatMessage[]
}

export type RealtimeNotification = {
  id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export type ChatServerEvents = {
  'realtime:connected': (payload: { service: 'chat-service'; userId: string }) => void
  'message:new': (payload: { conversationId: string; message: RealtimeChatMessage }) => void
  'message:read': (payload: { conversationId: string; userId: string; updatedCount: number }) => void
  'message:deleted': (payload: { conversationId: string; messageId: string }) => void
  'conversation:updated': (payload: { conversation: RealtimeConversation }) => void
  'typing:start': (payload: { conversationId: string; userId: string }) => void
  'typing:stop': (payload: { conversationId: string; userId: string }) => void
}

export type ChatClientEvents = {
  'conversation:join': (
    conversationId: string,
    ack?: (response: { success: boolean; message?: string }) => void,
  ) => void
  'conversation:leave': (
    conversationId: string,
    ack?: (response: { success: boolean; message?: string }) => void,
  ) => void
  'typing:start': (payload: { conversationId: string }) => void
  'typing:stop': (payload: { conversationId: string }) => void
}

export type NotificationServerEvents = {
  'realtime:connected': (payload: { service: 'notification-service'; userId: string }) => void
  'notification:new': (payload: { notification: RealtimeNotification }) => void
  'notification:read': (payload: { notification: RealtimeNotification }) => void
  'notification:deleted': (payload: { notificationId: string }) => void
  'notification:unread-count': (payload: { unreadCount: number }) => void
  'notifications:read-all': (payload: { updatedCount: number }) => void
}

type RealtimeOptions = {
  autoConnect?: boolean
  token?: string | null
}

function socketOptions(path: string, options: RealtimeOptions = {}) {
  return {
    path,
    autoConnect: options.autoConnect ?? true,
    withCredentials: true,
    auth: {
      token: options.token ?? getStoredToken() ?? '',
    },
  }
}

export function refreshSocketToken(socket: Socket, token = getStoredToken()) {
  socket.auth = {
    token: token ?? '',
  }
}

export function createChatSocket(options?: RealtimeOptions) {
  return io(API_ORIGIN, socketOptions('/api/chats/socket.io', options)) as Socket<
    ChatServerEvents,
    ChatClientEvents
  >
}

export function createNotificationSocket(options?: RealtimeOptions) {
  return io(API_ORIGIN, socketOptions('/api/notifications/socket.io', options)) as Socket<
    NotificationServerEvents
  >
}

export function createRealtimeSockets(options?: RealtimeOptions) {
  return {
    chatSocket: createChatSocket(options),
    notificationSocket: createNotificationSocket(options),
  }
}
