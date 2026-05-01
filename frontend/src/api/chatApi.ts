import { apiRequest } from './client'
import type { ChatMessage, Conversation } from '../types/chat'

type ConversationResponse = {
  success: boolean
  message: string
  conversation: Conversation
}

type ConversationsResponse = {
  success: boolean
  message: string
  conversations: Conversation[]
}

type MessagesResponse = {
  success: boolean
  message: string
  messages: ChatMessage[]
}

type SendMessageResponse = {
  success: boolean
  message: string
  chatMessage: ChatMessage
}

export function createOrGetConversation(participantId: string) {
  return apiRequest<ConversationResponse>('/chats/conversations', {
    method: 'POST',
    body: { participantId },
  })
}

export function getConversations() {
  return apiRequest<ConversationsResponse>('/chats/conversations')
}

export function getConversationById(id: string) {
  return apiRequest<ConversationResponse>(`/chats/conversations/${id}`)
}

export function getConversationMessages(id: string) {
  return apiRequest<MessagesResponse>(`/chats/conversations/${id}/messages`)
}

export function sendMessage(id: string, content: string) {
  return apiRequest<SendMessageResponse>(`/chats/conversations/${id}/messages`, {
    method: 'POST',
    body: { content },
  })
}

export function markConversationAsRead(id: string) {
  return apiRequest<{ success: boolean; message: string; updatedCount: number }>(
    `/chats/conversations/${id}/read`,
    {
      method: 'PATCH',
    },
  )
}

export function deleteMessage(messageId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/chats/messages/${messageId}`, {
    method: 'DELETE',
  })
}
