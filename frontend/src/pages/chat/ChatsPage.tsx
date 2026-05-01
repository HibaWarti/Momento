import { MessageCircle, Send, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  deleteMessage,
  getConversationById,
  getConversationMessages,
  getConversations,
  markConversationAsRead,
  sendMessage,
} from '../../api/chatApi'
import { getAssetUrl } from '../../api/client'
import { paths } from '../../routes/paths'
import { useAuthStore } from '../../store/authStore'
import type { ChatMessage, Conversation } from '../../types/chat'

export function ChatsPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageContent, setMessageContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === conversationId) ?? null,
    [conversations, conversationId],
  )

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await getConversations()
        setConversations(response.conversations)

        if (!conversationId && response.conversations.length > 0) {
          navigate(`/chats/${response.conversations[0].id}`, { replace: true })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversations')
      } finally {
        setIsLoading(false)
      }
    }

    void loadConversations()
  }, [conversationId, navigate])

  useEffect(() => {
    const loadConversationMessages = async () => {
      if (!conversationId) {
        setMessages([])
        return
      }

      try {
        const [conversationResponse, messagesResponse] = await Promise.all([
          getConversationById(conversationId),
          getConversationMessages(conversationId),
        ])

        setConversations((current) => {
          const existing = current.some((conversation) => conversation.id === conversationId)
          if (existing) {
            return current.map((conversation) =>
              conversation.id === conversationId
                ? { ...conversation, ...conversationResponse.conversation }
                : conversation,
            )
          }

          return [conversationResponse.conversation, ...current]
        })
        setMessages(messagesResponse.messages)
        await markConversationAsRead(conversationId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversation')
      }
    }

    void loadConversationMessages()
  }, [conversationId])

  const handleSendMessage = async () => {
    if (!conversationId || !messageContent.trim()) {
      return
    }

    try {
      setIsSending(true)
      const response = await sendMessage(conversationId, messageContent.trim())
      setMessages((current) => [...current, response.chatMessage])
      setMessageContent('')
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                updatedAt: new Date().toISOString(),
              }
            : conversation,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId)
      setMessages((current) => current.filter((message) => message.id !== messageId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message')
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-500"></div>
          <p className="mt-4 text-slate-600">Loading conversations...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {error && (
        <Card className="mb-6 border border-red-100 bg-red-50 text-red-700">{error}</Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <h1 className="text-xl font-bold text-slate-950">Messages</h1>
            <p className="text-sm text-slate-500">Your recent conversations</p>
          </div>

          <div className="divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                No conversations yet. Start from a provider profile or service page.
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherParticipant = conversation.participants.find(
                  (participant) => participant.userId !== user?.id,
                )
                const isActive = conversation.id === conversationId

                return (
                  <button
                    key={conversation.id}
                    className={`w-full px-5 py-4 text-left transition ${
                      isActive ? 'bg-orange-50' : 'bg-white hover:bg-slate-50'
                    }`}
                    onClick={() => navigate(`/chats/${conversation.id}`)}
                  >
                    <p className="font-semibold text-slate-950">
                      {otherParticipant
                        ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
                        : 'Conversation'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      @{otherParticipant?.user.username}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(conversation.updatedAt).toLocaleString()}
                    </p>
                  </button>
                )
              })
            )}
          </div>
        </Card>

        <Card className="flex min-h-[540px] flex-col">
          {selectedConversation ? (
            <>
              <div className="border-b border-slate-100 pb-4">
                {(() => {
                  const otherParticipant = selectedConversation.participants.find(
                    (participant) => participant.userId !== user?.id,
                  )
                  const pictureUrl = getAssetUrl(otherParticipant?.user.profilePicturePath)

                  return (
                    <div className="flex items-center gap-3">
                      {pictureUrl ? (
                        <img
                          src={pictureUrl}
                          alt={otherParticipant?.user.username}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                          {otherParticipant?.user.firstName?.[0] ?? 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-950">
                          {otherParticipant?.user.firstName} {otherParticipant?.user.lastName}
                        </p>
                        <p className="text-sm text-slate-500">
                          @{otherParticipant?.user.username}
                        </p>
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto py-4">
                {messages.map((message) => {
                  const isOwnMessage = message.senderId === user?.id

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                          isOwnMessage
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <p>{message.content}</p>
                        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                          <span className={isOwnMessage ? 'text-orange-100' : 'text-slate-400'}>
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                          {isOwnMessage ? (
                            <button
                              className={isOwnMessage ? 'text-orange-100' : 'text-slate-400'}
                              onClick={() => void handleDeleteMessage(message.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No messages yet. Start the conversation below.
                  </div>
                ) : null}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex gap-3">
                  <textarea
                    rows={2}
                    value={messageContent}
                    onChange={(event) => setMessageContent(event.target.value)}
                    placeholder="Write a message..."
                    className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                  <Button onClick={() => void handleSendMessage()} disabled={isSending}>
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageCircle className="text-violet-500" size={42} />
              <h2 className="mt-4 text-xl font-bold text-slate-950">No conversation selected</h2>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Choose a conversation from the list or start one from a provider profile.
              </p>
              <Button className="mt-6" onClick={() => navigate(paths.providers)}>
                Browse providers
              </Button>
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}
