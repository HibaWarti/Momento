import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { prisma } from './prisma'
import { authenticate } from './middleware/auth.middleware'
import { profileUpload } from './utils/upload'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3002
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const ADMIN_FRONTEND_URL = process.env.ADMIN_FRONTEND_URL || 'http://localhost:5174'
const allowedOrigins = new Set([
  FRONTEND_URL,
  ADMIN_FRONTEND_URL, 
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
])
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006'
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || 'change_this_internal_secret'

type NotificationType =
  | 'LIKE'
  | 'COMMENT'
  | 'FOLLOW'
  | 'PROVIDER_REQUEST_APPROVED'
  | 'PROVIDER_REQUEST_REJECTED'
  | 'REPORT_STATUS'
  | 'TICKET_STATUS'
  | 'TICKET_REPLY'
  | 'SYSTEM'

async function createNotification(payload: {
  userId: string
  type: NotificationType
  title: string
  message: string
}) {
  try {
    const response = await fetch(`${NOTIFICATION_SERVICE_URL}/internal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': INTERNAL_API_SECRET,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('Failed to create notification', response.status, await response.text())
    }
  } catch (error) {
    console.error('Failed to create notification', error)
  }
}

async function notifyAdmins(title: string, message: string) {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'SUPERADMIN'],
      },
      accountStatus: 'ACTIVE',
    },
    select: {
      id: true,
    },
  })

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: 'REPORT_STATUS',
        title,
        message,
      }),
    ),
  )
}

const allowedTicketCategories = ['ACCOUNT', 'TECHNICAL', 'REPORT', 'PROVIDER', 'OTHER'] as const
const allowedTicketPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const

function normalizeEnumValue<T extends readonly string[]>(
  value: unknown,
  allowedValues: T,
  fallback: T[number],
): T[number] {
  const normalized = value === undefined || value === null
    ? fallback
    : String(value).trim().toUpperCase()

  return allowedValues.includes(normalized) ? normalized : fallback
}

app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true)
      return callback(new Error(`Origin ${origin} is not allowed by CORS`))
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'User Service is running',
    service: 'user-service',
  })
})

app.get('/db-health', async (_req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count()

    return res.status(200).json({
      success: true,
      message: 'User Service database connection is working',
      service: 'user-service',
      users: userCount,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'User Service database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/profile/me', authenticate, (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Authenticated user profile retrieved successfully',
    user: res.locals.user,
  })
})

app.patch('/profile/me', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user
    const { firstName, lastName, username, bio } = req.body

    if (!firstName && !lastName && !username && bio === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required',
      })
    }

    const updateData: {
      firstName?: string
      lastName?: string
      username?: string
      bio?: string | null
    } = {}

    if (firstName) updateData.firstName = String(firstName).trim()
    if (lastName) updateData.lastName = String(lastName).trim()
    if (bio !== undefined) updateData.bio = bio ? String(bio).trim() : null

    if (username) {
      const normalizedUsername = String(username).trim().toLowerCase()

      const existingUser = await prisma.user.findFirst({
        where: {
          username: normalizedUsername,
          NOT: {
            id: currentUser.id,
          },
        },
      })

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists',
        })
      }

      updateData.username = normalizedUsername
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: updateData,
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
        createdAt: true,
        updatedAt: true,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/:id/follow', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const userToFollowId = String(req.params.id)

    if (!userToFollowId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      })
    }

    if (currentUser.id === userToFollowId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      })
    }

    const userToFollow = await prisma.user.findUnique({
      where: {
        id: userToFollowId,
      },
      select: {
        id: true,
        accountStatus: true,
      },
    })

    if (!userToFollow || userToFollow.accountStatus === 'DELETED') {
      return res.status(404).json({
        success: false,
        message: 'User to follow not found',
      })
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userToFollowId,
        },
      },
    })

    if (existingFollow) {
      return res.status(409).json({
        success: false,
        message: 'You already follow this user',
      })
    }

    const follow = await prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: userToFollowId,
      },
    })

    const follower = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        firstName: true,
        lastName: true,
      },
    })

    await createNotification({
      userId: userToFollowId,
      type: 'FOLLOW',
      title: 'New follower',
      message: `${follower?.firstName ?? 'Someone'} ${follower?.lastName ?? ''} started following you.`.trim(),
    })

    return res.status(201).json({
      success: true,
      message: 'User followed successfully',
      follow,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to follow user',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.delete('/:id/follow', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const userToUnfollowId = String(req.params.id)

    if (!userToUnfollowId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      })
    }

    if (currentUser.id === userToUnfollowId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot unfollow yourself',
      })
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userToUnfollowId,
        },
      },
    })

    if (!existingFollow) {
      return res.status(404).json({
        success: false,
        message: 'Follow relation not found',
      })
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userToUnfollowId,
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'User unfollowed successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to unfollow user',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/:id/followers', async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id)

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        accountStatus: true,
      },
    })

    if (!user || user.accountStatus === 'DELETED') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicturePath: true,
            bio: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Followers retrieved successfully',
      followers: followers.map((follow) => follow.follower),
      count: followers.length,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve followers',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/:id/following', async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id)

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        accountStatus: true,
      },
    })

    if (!user || user.accountStatus === 'DELETED') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const following = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicturePath: true,
            bio: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Following retrieved successfully',
      following: following.map((follow) => follow.following),
      count: following.length,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve following',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/:id/reports', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const reportedUserId = String(req.params.id)
    const { reason, description } = req.body

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required',
      })
    }

    if (currentUser.id === reportedUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report yourself',
      })
    }

    const reportedUser = await prisma.user.findUnique({
      where: {
        id: reportedUserId,
      },
      select: {
        id: true,
        accountStatus: true,
      },
    })

    if (!reportedUser || reportedUser.accountStatus === 'DELETED') {
      return res.status(404).json({
        success: false,
        message: 'User to report not found',
      })
    }

    const report = await prisma.report.create({
      data: {
        reporterId: currentUser.id,
        reportedUserId,
        reason: String(reason).trim(),
        description:
          description !== undefined && description !== null
            ? String(description).trim()
            : null,
      },
    })

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'REPORT_CREATED',
        entityType: 'USER',
        entityId: reportedUserId,
        description: `User report created: ${String(reason).trim()}`,
      },
    })

    await notifyAdmins('New user report', 'A user profile was reported for moderation review.')

    return res.status(201).json({
      success: true,
      message: 'User reported successfully',
      report,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to report user',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/tickets', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const {
      subject,
      description,
      category,
      priority,
      relatedUserId,
      relatedPostId,
      relatedCommentId,
      relatedServiceId,
      relatedReportId,
    } = req.body

    if (!subject || !String(subject).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Ticket subject is required',
      })
    }

    if (!description || !String(description).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Ticket description is required',
      })
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: currentUser.id,
        subject: String(subject).trim(),
        description: String(description).trim(),
        category: normalizeEnumValue(category, allowedTicketCategories, 'OTHER'),
        priority: normalizeEnumValue(priority, allowedTicketPriorities, 'NORMAL'),
        relatedUserId: relatedUserId ? String(relatedUserId) : null,
        relatedPostId: relatedPostId ? String(relatedPostId) : null,
        relatedCommentId: relatedCommentId ? String(relatedCommentId) : null,
        relatedServiceId: relatedServiceId ? String(relatedServiceId) : null,
        relatedReportId: relatedReportId ? String(relatedReportId) : null,
        messages: {
          create: {
            authorId: currentUser.id,
            message: String(description).trim(),
            isStaff: false,
          },
        },
      },
      include: {
        messages: {
          include: {
            author: {
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
      },
    })

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'TICKET_CREATED',
        entityType: 'SUPPORT_TICKET',
        entityId: ticket.id,
        description: ticket.subject,
      },
    })

    await notifyAdmins('New support ticket', 'A user opened a support ticket.')

    return res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/tickets', authenticate, async (_req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }

    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Support tickets retrieved successfully',
      tickets,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve support tickets',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/tickets/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const ticketId = String(req.params.id)

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId: currentUser.id,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        relatedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicturePath: true,
          },
        },
        relatedPost: true,
        relatedComment: true,
        relatedService: true,
        relatedReport: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            author: {
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
      },
    })

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Support ticket retrieved successfully',
      ticket,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve support ticket',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/tickets/:id/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const ticketId = String(req.params.id)
    const { message } = req.body

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      })
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId: currentUser.id,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found',
      })
    }

    if (ticket.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        message: 'Closed tickets cannot receive new messages',
      })
    }

    const ticketMessage = await prisma.supportTicketMessage.create({
      data: {
        ticketId,
        authorId: currentUser.id,
        message: String(message).trim(),
        isStaff: false,
      },
      include: {
        author: {
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
    })

    await prisma.supportTicket.update({
      where: {
        id: ticketId,
      },
      data: {
        status: ticket.status === 'RESOLVED' ? 'WAITING_FOR_USER' : ticket.status,
      },
    })

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'TICKET_MESSAGE_CREATED',
        entityType: 'SUPPORT_TICKET',
        entityId: ticketId,
        description: 'User added a support ticket message',
      },
    })

    await notifyAdmins('New ticket reply', 'A user replied to a support ticket.')

    return res.status(201).json({
      success: true,
      message: 'Support ticket message created successfully',
      ticketMessage,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create support ticket message',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/tickets/:id/close', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const ticketId = String(req.params.id)

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId: currentUser.id,
      },
      select: {
        id: true,
      },
    })

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found',
      })
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: {
        id: ticketId,
      },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    })

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'TICKET_UPDATED',
        entityType: 'SUPPORT_TICKET',
        entityId: ticketId,
        description: 'User closed a support ticket',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Support ticket closed successfully',
      ticket: updatedTicket,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to close support ticket',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: {
        id: String(id),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        profilePicturePath: true,
        bio: true,
        role: true,
        accountStatus: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    })

    if (!user || user.accountStatus === 'DELETED') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      user,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/profile/me/picture', authenticate, (req: Request, res: Response) => {
  profileUpload.single('profilePicture')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : 'File upload failed',
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Profile picture is required',
      })
    }

    try {
      const currentUser = res.locals.user as { id: string }
      const profilePicturePath = `/uploads/profiles/${req.file.filename}`

      const updatedUser = await prisma.user.update({
        where: {
          id: currentUser.id,
        },
        data: {
          profilePicturePath,
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
          createdAt: true,
          updatedAt: true,
        },
      })

      return res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        user: updatedUser,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile picture',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })
})

app.listen(PORT, () => {
  console.log(`User Service running on http://localhost:${PORT}`)
})
