import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import http from 'http'
import jwt from 'jsonwebtoken'
import { Server, Socket } from 'socket.io'
import { prisma } from './prisma'
import { authenticate } from './middleware/auth.middleware'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3007
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
})

type JwtPayload = {
  userId: string
  email: string
  role: string
}

type SocketUser = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  profilePicturePath: string | null
  bio: string | null
  role: string
  accountStatus: string
}

type SocketAck = (response: { success: boolean; message?: string }) => void

const userRoom = (userId: string) => `user:${userId}`
const conversationRoom = (conversationId: string) => `conversation:${conversationId}`

function getSocketToken(socket: Socket) {
  const authToken = socket.handshake.auth?.token

  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken
  }

  const authHeader = socket.handshake.headers.authorization

  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1]
  }

  return null
}

async function authenticateSocket(socket: Socket, next: (error?: Error) => void) {
  try {
    const token = getSocketToken(socket)
    const secret = process.env.JWT_SECRET

    if (!token) {
      return next(new Error('Authentication token is required'))
    }

    if (!secret) {
      return next(new Error('JWT_SECRET is not defined'))
    }

    const decoded = jwt.verify(token, secret) as JwtPayload

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        profilePicturePath: true,
        bio: true,
        role: true,
        accountStatus: true,
      },
    })

    if (!user || user.accountStatus !== 'ACTIVE') {
      return next(new Error('Invalid or inactive user'))
    }

    socket.data.user = user

    return next()
  } catch (error) {
    return next(
      new Error(error instanceof Error ? error.message : 'Invalid or expired authentication token'),
    )
  }
}

async function isConversationParticipant(conversationId: string, userId: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  })

  return Boolean(participant)
}

async function getConversationParticipantIds(conversationId: string) {
  const participants = await prisma.conversationParticipant.findMany({
    where: {
      conversationId,
    },
    select: {
      userId: true,
    },
  })

  return participants.map((participant) => participant.userId)
}

async function emitConversationUpdated(conversationId: string, participantIds?: string[]) {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              profilePicturePath: true,
              role: true,
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              profilePicturePath: true,
            },
          },
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  })

  if (!conversation) {
    return
  }

  const recipients = participantIds ?? conversation.participants.map((participant) => participant.userId)

  await Promise.all(
    recipients.map(async (userId) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId,
          isRead: false,
          senderId: {
            not: userId,
          },
        },
      })

      io.to(userRoom(userId)).emit('conversation:updated', {
        conversation: {
          ...conversation,
          unreadCount,
        },
      })
    }),
  )
}

async function emitToConversationParticipants(
  conversationId: string,
  eventName: string,
  payload: unknown,
  excludeUserId?: string,
) {
  const participantIds = await getConversationParticipantIds(conversationId)

  participantIds
    .filter((userId) => userId !== excludeUserId)
    .forEach((userId) => {
      io.to(userRoom(userId)).emit(eventName, payload)
    })
}

io.use(authenticateSocket)

io.on('connection', (socket: Socket) => {
  const user = socket.data.user as SocketUser

  socket.join(userRoom(user.id))
  socket.emit('realtime:connected', {
    service: 'chat-service',
    userId: user.id,
  })

  socket.on('conversation:join', async (conversationId: string, ack?: SocketAck) => {
    try {
      const isParticipant = await isConversationParticipant(String(conversationId), user.id)

      if (!isParticipant) {
        ack?.({
          success: false,
          message: 'You are not allowed to join this conversation',
        })
        return
      }

      socket.join(conversationRoom(String(conversationId)))
      ack?.({ success: true })
    } catch (error) {
      ack?.({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to join conversation',
      })
    }
  })

  socket.on('conversation:leave', (conversationId: string, ack?: SocketAck) => {
    socket.leave(conversationRoom(String(conversationId)))
    ack?.({ success: true })
  })

  socket.on('typing:start', async (payload: { conversationId?: string }) => {
    if (!payload.conversationId) {
      return
    }

    const conversationId = String(payload.conversationId)
    const isParticipant = await isConversationParticipant(conversationId, user.id)

    if (!isParticipant) {
      return
    }

    await emitToConversationParticipants(
      conversationId,
      'typing:start',
      {
        conversationId,
        userId: user.id,
      },
      user.id,
    )
  })

  socket.on('typing:stop', async (payload: { conversationId?: string }) => {
    if (!payload.conversationId) {
      return
    }

    const conversationId = String(payload.conversationId)
    const isParticipant = await isConversationParticipant(conversationId, user.id)

    if (!isParticipant) {
      return
    }

    await emitToConversationParticipants(
      conversationId,
      'typing:stop',
      {
        conversationId,
        userId: user.id,
      },
      user.id,
    )
  })
})

app.use(helmet())
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
)
app.use(morgan('dev'))
app.use(express.json())

app.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Chat Service is running',
    service: 'chat-service',
  })
})

app.get('/db-health', async (_req: Request, res: Response) => {
  try {
    const conversationCount = await prisma.conversation.count()
    const messageCount = await prisma.message.count()

    return res.status(200).json({
      success: true,
      message: 'Chat Service database connection is working',
      service: 'chat-service',
      conversations: conversationCount,
      messages: messageCount,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Chat Service database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/auth-check', authenticate, (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Chat Service authentication is working',
    user: res.locals.user,
  })
})

app.post('/conversations', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const { participantId } = req.body

    if (!participantId || !String(participantId).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required',
      })
    }

    const otherUserId = String(participantId)

    if (currentUser.id === otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot create a conversation with yourself',
      })
    }

    const otherUser = await prisma.user.findUnique({
      where: {
        id: otherUserId,
      },
      select: {
        id: true,
        accountStatus: true,
      },
    })

    if (!otherUser || otherUser.accountStatus !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: 'Participant not found or inactive',
      })
    }

    const existingConversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: currentUser.id,
          },
        },
      },
      include: {
        participants: true,
      },
    })

    const existingConversation = existingConversations.find((conversation) => {
      const participantIds = conversation.participants.map((participant) => participant.userId)

      return (
        participantIds.length === 2 &&
        participantIds.includes(currentUser.id) &&
        participantIds.includes(otherUserId)
      )
    })

    if (existingConversation) {
      const conversation = await prisma.conversation.findUnique({
        where: {
          id: existingConversation.id,
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  username: true,
                  profilePicturePath: true,
                  role: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  username: true,
                  profilePicturePath: true,
                },
              },
            },
          },
        },
      })

      return res.status(200).json({
        success: true,
        message: 'Existing conversation retrieved successfully',
        conversation,
      })
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            {
              userId: currentUser.id,
            },
            {
              userId: otherUserId,
            },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicturePath: true,
                role: true,
              },
            },
          },
        },
        messages: true,
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      conversation,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create or retrieve conversation',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/conversations', authenticate, async (_req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: currentUser.id,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicturePath: true,
                role: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicturePath: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    })

    const conversationsWithUnreadCount = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            isRead: false,
            senderId: {
              not: currentUser.id,
            },
          },
        })

        return {
          ...conversation,
          unreadCount,
        }
      }),
    )

    return res.status(200).json({
      success: true,
      message: 'Conversations retrieved successfully',
      conversations: conversationsWithUnreadCount,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversations',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/conversations/:id/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const conversationId = String(req.params.id)

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUser.id,
        },
      },
    })

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to access this conversation',
      })
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicturePath: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Conversation messages retrieved successfully',
      messages,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversation messages',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/conversations/:id/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const conversationId = String(req.params.id)
    const { content } = req.body

    if (!content || !String(content).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      })
    }

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUser.id,
        },
      },
    })

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to send messages in this conversation',
      })
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: currentUser.id,
        content: String(content).trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicturePath: true,
          },
        },
      },
    })

    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    })

    const participantIds = await getConversationParticipantIds(conversationId)

    participantIds.forEach((userId) => {
      io.to(userRoom(userId)).emit('message:new', {
        conversationId,
        message,
      })
    })

    await emitConversationUpdated(conversationId, participantIds)

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      chatMessage: message,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/conversations/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const conversationId = String(req.params.id)

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUser.id,
        },
      },
    })

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to access this conversation',
      })
    }

    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: currentUser.id,
        },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    const participantIds = await getConversationParticipantIds(conversationId)

    participantIds.forEach((userId) => {
      io.to(userRoom(userId)).emit('message:read', {
        conversationId,
        userId: currentUser.id,
        updatedCount: result.count,
      })
    })

    await emitConversationUpdated(conversationId, participantIds)

    return res.status(200).json({
      success: true,
      message: 'Conversation messages marked as read successfully',
      updatedCount: result.count,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark conversation messages as read',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/conversations/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const conversationId = String(req.params.id)

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUser.id,
        },
      },
    })

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to access this conversation',
      })
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicturePath: true,
                role: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicturePath: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    })

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation details retrieved successfully',
      conversation,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversation details',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.delete('/messages/:messageId', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const messageId = String(req.params.messageId)

    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    })

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      })
    }

    if (message.senderId !== currentUser.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      })
    }

    const participantIds = await getConversationParticipantIds(message.conversationId)

    await prisma.message.delete({
      where: {
        id: messageId,
      },
    })

    participantIds.forEach((userId) => {
      io.to(userRoom(userId)).emit('message:deleted', {
        conversationId: message.conversationId,
        messageId,
      })
    })

    await emitConversationUpdated(message.conversationId, participantIds)

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

server.listen(PORT, () => {
  console.log(`Chat Service running on port ${PORT}`)
})
