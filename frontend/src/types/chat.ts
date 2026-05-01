import type { UserSummary } from './user'

export type ChatMessage = {
  id: string
  conversationId: string
  senderId: string
  content: string
  isRead: boolean
  createdAt: string
  sender: UserSummary
}

export type ConversationParticipant = {
  id: string
  conversationId: string
  userId: string
  createdAt: string
  user: UserSummary
}

export type Conversation = {
  id: string
  createdAt: string
  updatedAt: string
  participants: ConversationParticipant[]
  messages?: ChatMessage[]
  unreadCount?: number
  _count?: {
    messages?: number
  }
}
