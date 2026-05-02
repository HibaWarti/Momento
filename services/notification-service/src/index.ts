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

const PORT = process.env.PORT || 3006
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

const userRoom = (userId: string) => `user:${userId}`

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

async function emitUnreadCount(userId: string) {
  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  })

  io.to(userRoom(userId)).emit('notification:unread-count', {
    unreadCount,
  })
}

async function emitNotificationCreated(userId: string, notification: unknown) {
  io.to(userRoom(userId)).emit('notification:new', {
    notification,
  })

  await emitUnreadCount(userId)
}

io.use(authenticateSocket)

io.on('connection', (socket: Socket) => {
  const user = socket.data.user as SocketUser

  socket.join(userRoom(user.id))
  socket.emit('realtime:connected', {
    service: 'notification-service',
    userId: user.id,
  })
})

app.use(helmet())
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
)
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Notification Service is running',
    service: 'notification-service',
  })
})

app.get('/db-health', async (_req: Request, res: Response) => {
  try {
    const notificationCount = await prisma.notification.count()

    return res.status(200).json({
      success: true,
      message: 'Notification Service database connection is working',
      service: 'notification-service',
      notifications: notificationCount,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Notification Service database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/auth-check', authenticate, (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Notification Service authentication is working',
    user: res.locals.user,
  })
})

app.post('/internal', async (req: Request, res: Response) => {
  try {
    const internalSecret = req.headers['x-internal-secret']
    const expectedSecret = process.env.INTERNAL_API_SECRET

    if (!internalSecret || internalSecret !== expectedSecret) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      })
    }

    const { userId, type, title, message } = req.body

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      })
    }

    const validTypes = [
      'LIKE',
      'COMMENT',
      'FOLLOW',
      'PROVIDER_REQUEST_APPROVED',
      'PROVIDER_REQUEST_REJECTED',
      'REPORT_STATUS',
      'SYSTEM',
    ]

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type',
      })
    }

    const userExists = await prisma.user.findUnique({
      where: {
        id: String(userId),
      },
      select: {
        id: true,
      },
    })

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const notification = await prisma.notification.create({
      data: {
        userId: String(userId),
        type: type as any,
        title: String(title).trim(),
        message: String(message).trim(),
        isRead: false,
      },
    })

    await emitNotificationCreated(String(userId), notification)

    return res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/unread-count', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }

    const unreadCount = await prisma.notification.count({
      where: {
        userId: currentUser.id,
        isRead: false,
      },
    })

    return res.status(200).json({
      success: true,
      unreadCount,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }

    const updatedCount = await prisma.notification.updateMany({
      where: {
        userId: currentUser.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    io.to(userRoom(currentUser.id)).emit('notifications:read-all', {
      updatedCount: updatedCount.count,
    })

    await emitUnreadCount(currentUser.id)

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount: updatedCount.count,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all as read',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      notifications,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const id = String(req.params.id)

    const notification = await prisma.notification.findUnique({
      where: {
        id,
      },
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      })
    }

    if (notification.userId !== currentUser.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to mark this notification as read',
      })
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    })

    io.to(userRoom(currentUser.id)).emit('notification:read', {
      notification: updatedNotification,
    })

    await emitUnreadCount(currentUser.id)

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read successfully',
      notification: updatedNotification,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const id = String(req.params.id)

    const notification = await prisma.notification.findUnique({
      where: {
        id,
      },
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      })
    }

    if (notification.userId !== currentUser.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this notification',
      })
    }

    await prisma.notification.delete({
      where: {
        id,
      },
    })

    io.to(userRoom(currentUser.id)).emit('notification:deleted', {
      notificationId: id,
    })

    await emitUnreadCount(currentUser.id)

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

server.listen(PORT, () => {
  console.log(`Notification Service running on http://localhost:${PORT}`)
})
