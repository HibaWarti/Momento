import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { prisma } from './prisma'
import { authenticate } from './middleware/auth.middleware'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3007
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

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

    await prisma.message.delete({
      where: {
        id: messageId,
      },
    })

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

app.listen(PORT, () => {
  console.log(`Chat Service running on port ${PORT}`)
})