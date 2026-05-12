import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { authenticate } from './middleware/auth.middleware'
import { requireAdmin, requireSuperAdmin } from './middleware/role.middleware'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3005
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

const allowedTicketStatuses = ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'] as const
const allowedTicketPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const

const defaultServiceCategories = [
  {
    category: 'Traiteur',
    subcategories: ['Chinese Food', 'Moroccan Food', 'French Food', 'Buffet', 'Pastry', 'Wedding Catering'],
  },
  {
    category: 'Events',
    subcategories: ['Decoration', 'Wedding Planning', 'Birthday Planning', 'Florist', 'Venue Setup'],
  },
  {
    category: 'Beauty',
    subcategories: ['Makeup', 'Hair Styling', 'Henna', 'Nails', 'Skin Care'],
  },
  {
    category: 'Media',
    subcategories: ['Photography', 'Videography', 'Reels', 'Drone', 'Photo Booth'],
  },
  {
    category: 'Entertainment',
    subcategories: ['DJ', 'Live Band', 'Traditional Music', 'Kids Animation', 'Host'],
  },
]

function normalizeEnumValue<T extends readonly string[]>(
  value: unknown,
  allowedValues: T,
): T[number] | null {
  if (value === undefined || value === null) {
    return null
  }

  const normalized = String(value).trim().toUpperCase()

  return allowedValues.includes(normalized) ? normalized : null
}

async function ensureDefaultServiceCategories() {
  await Promise.all(
    defaultServiceCategories.map(async (item) => {
      const category = await prisma.category.upsert({
        where: {
          name: item.category,
        },
        update: {},
        create: {
          name: item.category,
        },
      })

      await Promise.all(
        item.subcategories.map((subcategory) =>
          prisma.subcategory.upsert({
            where: {
              categoryId_name: {
                categoryId: category.id,
                name: subcategory,
              },
            },
            update: {},
            create: {
              categoryId: category.id,
              name: subcategory,
            },
          }),
        ),
      )
    }),
  )
}

app.use(helmet())
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`))
  },
  credentials: true,
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Admin Service is running',
    service: 'admin-service',
  })
})

app.get('/db-health', async (_req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count()

    return res.status(200).json({
      success: true,
      message: 'Admin Service database connection is working',
      service: 'admin-service',
      users: userCount,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Admin Service database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/auth-check', authenticate, requireAdmin, (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Admin Service authentication is working',
    user: res.locals.user,
  })
})

app.get('/superadmin/auth-check', authenticate, requireSuperAdmin, (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Admin Service superadmin authentication is working',
    user: res.locals.user,
  })
})

app.get('/users', authenticate, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const usersBase = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
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
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            providerRequests: true,
            reportsAgainstUser: true,
          },
        },
      },
    })

    const users = await Promise.all(
      usersBase.map(async (user) => {
        const reportsTotal = await prisma.report.count({
          where: {
            OR: [
              { reportedUserId: user.id },
              { post: { authorId: user.id } },
              { comment: { userId: user.id } },
              { service: { providerProfile: { userId: user.id } } },
            ],
          },
        })
        return { ...user, reportsTotal }
      }),
    )

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      users,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/users/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id)

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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
        providerProfile: true,
        providerRequests: {
          orderBy: {
            submittedAt: 'desc',
          },
          take: 5,
        },
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            providerRequests: true,
            reportsAgainstUser: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const reportsTotal = await prisma.report.count({
      where: {
        OR: [
          { reportedUserId: user.id },
          { post: { authorId: user.id } },
          { comment: { userId: user.id } },
          { service: { providerProfile: { userId: user.id } } },
        ],
      },
    })

    return res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      user: { ...user, reportsTotal },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/users/:id/block', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string; role: string }
    const userId = String(req.params.id)

    if (currentUser.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block yourself',
      })
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
      },
    })

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    if (targetUser.role === 'SUPERADMIN' && currentUser.role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin cannot block super admin',
      })
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        accountStatus: 'BLOCKED',
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

    return res.status(200).json({
      success: true,
      message: 'User blocked successfully',
      user: updatedUser,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to block user',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/users/:id/unblock', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string; role: string }
    const userId = String(req.params.id)

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        accountStatus: 'ACTIVE',
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

    return res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
      user: updatedUser,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to unblock user',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/provider-requests', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined

    const providerRequests = await prisma.providerRequest.findMany({
      where: status
        ? {
            status: status as any,
          }
        : {},
      orderBy: {
        submittedAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            profilePicturePath: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Provider requests retrieved successfully',
      providerRequests,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve provider requests',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/provider-requests/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const requestId = String(req.params.id)

    const providerRequest = await prisma.providerRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            profilePicturePath: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!providerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Provider request not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Provider request retrieved successfully',
      providerRequest,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve provider request',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/provider-requests/:id/reviewing', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const requestId = String(req.params.id)

    const providerRequest = await prisma.providerRequest.findUnique({
      where: {
        id: requestId,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!providerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Provider request not found',
      })
    }

    if (['APPROVED', 'REJECTED'].includes(providerRequest.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark approved/rejected request as reviewing',
      })
    }

    const updatedRequest = await prisma.providerRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: 'REVIEWING',
        reviewedById: currentUser.id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            profilePicturePath: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Provider request marked as reviewing',
      providerRequest: updatedRequest,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark provider request as reviewing',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/provider-requests/:id/approve', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const requestId = String(req.params.id)

    const providerRequest = await prisma.providerRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        user: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    })

    if (!providerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Provider request not found',
      })
    }

    if (providerRequest.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Provider request already approved',
      })
    }

    if (providerRequest.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve a rejected request',
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.providerRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedById: currentUser.id,
        },
      })

      const updatedUser = await tx.user.update({
        where: {
          id: providerRequest.userId,
        },
        data: {
          role: 'PROVIDER',
        },
      })

      const existingProfile = await tx.providerProfile.findUnique({
        where: {
          userId: providerRequest.userId,
        },
      })

      let providerProfile

      if (!existingProfile) {
        providerProfile = await tx.providerProfile.create({
          data: {
            userId: providerRequest.userId,
            professionalName: providerRequest.professionalName,
            professionalDescription: providerRequest.professionalDescription,
            phone: providerRequest.phone,
            city: providerRequest.city,
          },
        })
      } else {
        providerProfile = existingProfile
      }

      return { updatedRequest, updatedUser, providerProfile }
    })

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'PROVIDER_REQUEST_APPROVED',
        entityType: 'PROVIDER_REQUEST',
        entityId: requestId,
        description: 'Provider request approved by admin',
      },
    })

    await createNotification({
      userId: providerRequest.userId,
      type: 'PROVIDER_REQUEST_APPROVED',
      title: 'Provider request approved',
      message: 'Your provider request was approved. You can now publish services.',
    })

    return res.status(200).json({
      success: true,
      message: 'Provider request approved successfully',
      providerRequest: result.updatedRequest,
      user: result.updatedUser,
      providerProfile: result.providerProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to approve provider request',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/provider-requests/:id/reject', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const requestId = String(req.params.id)

    const providerRequest = await prisma.providerRequest.findUnique({
      where: {
        id: requestId,
      },
      select: {
        id: true,
        status: true,
        userId: true,
      },
    })

    if (!providerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Provider request not found',
      })
    }

    if (providerRequest.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'Provider request already rejected',
      })
    }

    const updatedRequest = await prisma.providerRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedById: currentUser.id,
      },
    })

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'PROVIDER_REQUEST_SUBMITTED',
        entityType: 'PROVIDER_REQUEST',
        entityId: requestId,
        description: 'Provider request marked as REVIEWING by admin',
      },
    })

    await createNotification({
      userId: providerRequest.userId,
      type: 'PROVIDER_REQUEST_REJECTED',
      title: 'Provider request rejected',
      message: 'Your provider request was rejected. You can review your information and try again later.',
    })

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'PROVIDER_REQUEST_REJECTED',
        entityType: 'PROVIDER_REQUEST',
        entityId: requestId,
        description: 'Provider request rejected by admin',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Provider request rejected successfully',
      providerRequest: updatedRequest,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reject provider request',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/reports', authenticate, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            profilePicturePath: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            profilePicturePath: true,
          },
        },
        post: true,
        comment: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
                profilePicturePath: true,
              },
            },
            post: true,
          },
        },
        service: true,
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Reports retrieved successfully',
      reports,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/reports/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const reportId = String(req.params.id)

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            profilePicturePath: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            profilePicturePath: true,
          },
        },
        post: true,
        comment: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
                profilePicturePath: true,
              },
            },
            post: true,
          },
        },
        service: true,
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Report retrieved successfully',
      report,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve report',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/reports/:id/reviewing', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const reportId = String(req.params.id)

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      })
    }

    const updatedReport = await prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        status: 'REVIEWING',
        reviewedById: currentUser.id,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Report marked as reviewing',
      report: updatedReport,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark report as reviewing',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/reports/:id/resolve', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const reportId = String(req.params.id)
    const { moderationNote, actionTaken } = req.body
    const action = actionTaken ? String(actionTaken).trim() : 'NO_ACTION'

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        id: true,
        reporterId: true,
        reportedUserId: true,
        postId: true,
        commentId: true,
        serviceId: true,
        post: {
          select: {
            authorId: true,
          },
        },
        comment: {
          select: {
            userId: true,
          },
        },
        service: {
          select: {
            providerProfile: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      })
    }

    const updatedReport = await prisma.$transaction(async (tx) => {
      if (action === 'HIDE_POST' && report.postId) {
        await tx.post.update({ where: { id: report.postId }, data: { status: 'HIDDEN' } })
      }

      if (action === 'DELETE_COMMENT' && report.commentId) {
        await tx.comment.update({ where: { id: report.commentId }, data: { status: 'DELETED' } })
      }

      if (action === 'HIDE_SERVICE' && report.serviceId) {
        await tx.service.update({ where: { id: report.serviceId }, data: { status: 'HIDDEN' } })
      }

      if (action === 'BAN_USER') {
        const targetUserId = report.reportedUserId || report.post?.authorId || report.comment?.userId || report.service?.providerProfile.userId
        if (targetUserId && targetUserId !== currentUser.id) {
          await tx.user.update({ where: { id: targetUserId }, data: { accountStatus: 'BLOCKED' } })
        }
      }

      return tx.report.update({
        where: {
          id: reportId,
        },
        data: {
          status: 'RESOLVED',
          moderationNote:
            moderationNote !== undefined && moderationNote !== null
              ? String(moderationNote).trim()
              : undefined,
          actionTaken: action,
          reviewedAt: new Date(),
          reviewedById: currentUser.id,
        },
      })
    })

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'REPORT_REVIEWED',
        entityType: 'REPORT',
        entityId: reportId,
        description: 'Report resolved',
      },
    })

    await createNotification({
      userId: report.reporterId,
      type: 'REPORT_STATUS',
      title: 'Report resolved',
      message: 'Your report was reviewed and marked as resolved.',
    })

    const warnedUserId = report.reportedUserId || report.post?.authorId || report.comment?.userId || report.service?.providerProfile.userId
    if (warnedUserId && ['WARN_USER', 'HIDE_POST', 'DELETE_COMMENT', 'HIDE_SERVICE'].includes(action)) {
      await createNotification({
        userId: warnedUserId,
        type: 'SYSTEM',
        title: 'Moderation notice',
        message: moderationNote ? String(moderationNote).trim() : 'A moderator reviewed content connected to your account.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Report resolved successfully',
      report: updatedReport,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to resolve report',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/reports/:id/reject', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const reportId = String(req.params.id)
    const { moderationNote, actionTaken } = req.body

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        id: true,
        reporterId: true,
      },
    })

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      })
    }

    const updatedReport = await prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        status: 'REJECTED',
        moderationNote:
          moderationNote !== undefined && moderationNote !== null
            ? String(moderationNote).trim()
            : undefined,
        actionTaken:
          actionTaken !== undefined && actionTaken !== null
            ? String(actionTaken).trim()
            : undefined,
        reviewedAt: new Date(),
        reviewedById: currentUser.id,
      },
    })

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'REPORT_REVIEWED',
        entityType: 'REPORT',
        entityId: reportId,
        description: 'Report resolved',
      },
    })

    await createNotification({
      userId: report.reporterId,
      type: 'REPORT_STATUS',
      title: 'Report reviewed',
      message: 'Your report was reviewed and rejected.',
    })

    return res.status(200).json({
      success: true,
      message: 'Report rejected successfully',
      report: updatedReport,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reject report',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/superadmin/users/:id/role', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const userId = String(req.params.id)
    const nextRole = String(req.body?.role || '').trim().toUpperCase()

    if (!['USER', 'PROVIDER', 'ADMIN', 'SUPERADMIN'].includes(nextRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }

    if (currentUser.id === userId) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: nextRole as any },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        accountStatus: true,
      },
    })

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'USER_UNBLOCKED',
        entityType: 'USER',
        entityId: userId,
        description: `Role changed from ${existingUser.role} to ${nextRole}`,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/superadmin/users', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, username, email, password, role } = req.body
    const nextRole = String(role || 'USER').trim().toUpperCase()

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'firstName, lastName, username, email and password are required',
      })
    }

    if (!['USER', 'ADMIN'].includes(nextRole)) {
      return res.status(400).json({
        success: false,
        message: 'Only USER and ADMIN roles are allowed in this endpoint',
      })
    }

    const exists = await prisma.user.findFirst({
      where: {
        OR: [
          { email: String(email).trim().toLowerCase() },
          { username: String(username).trim() },
        ],
      },
      select: { id: true },
    })

    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Email or username already exists',
      })
    }

    const hashedPassword = await bcrypt.hash(String(password), 10)
    const createdUser = await prisma.user.create({
      data: {
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        username: String(username).trim(),
        email: String(email).trim().toLowerCase(),
        password: hashedPassword,
        role: nextRole as any,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        accountStatus: true,
        createdAt: true,
      },
    })

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: createdUser,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/superadmin/admins', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const userId = String(req.body?.userId || '').trim()

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User id is required' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (existingUser.role === 'SUPERADMIN') {
      return res.status(400).json({ success: false, message: 'Cannot modify superadmin role from this endpoint' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        accountStatus: true,
      },
    })

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'USER_UNBLOCKED',
        entityType: 'USER',
        entityId: userId,
        description: 'User promoted to ADMIN by superadmin',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Admin created successfully',
      user: updatedUser,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.delete('/superadmin/users/:id', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const userId = String(req.params.id)

    if (currentUser.id === userId) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (existingUser.role === 'SUPERADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot delete another superadmin' })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'DELETED' },
    })

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'USER_BLOCKED',
        entityType: 'USER',
        entityId: userId,
        description: 'User account marked as DELETED by superadmin',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/tickets', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = normalizeEnumValue(req.query.status, allowedTicketStatuses)

    const tickets = await prisma.supportTicket.findMany({
      where: status
        ? {
            status,
          }
        : {},
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            profilePicturePath: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
          },
        },
        relatedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            profilePicturePath: true,
          },
        },
        relatedPost: true,
        relatedComment: true,
        relatedService: true,
        relatedReport: true,
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

app.get('/tickets/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const ticketId = String(req.params.id)

    const ticket = await prisma.supportTicket.findUnique({
      where: {
        id: ticketId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            profilePicturePath: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
          },
        },
        relatedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            profilePicturePath: true,
          },
        },
        relatedPost: true,
        relatedComment: true,
        relatedService: true,
        relatedReport: {
          include: {
            reporter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
                profilePicturePath: true,
              },
            },
          },
        },
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
                email: true,
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

app.patch('/tickets/:id/status', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const ticketId = String(req.params.id)
    const { status, priority, assignedToId, assignToMe } = req.body
    const nextStatus = normalizeEnumValue(status, allowedTicketStatuses)
    const nextPriority = normalizeEnumValue(priority, allowedTicketPriorities)

    if (!nextStatus && !nextPriority && assignedToId === undefined && !assignToMe) {
      return res.status(400).json({
        success: false,
        message: 'Status, priority, or assignment is required',
      })
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: {
        id: ticketId,
      },
      select: {
        id: true,
        userId: true,
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
        status: nextStatus ?? undefined,
        priority: nextPriority ?? undefined,
        assignedToId: assignToMe ? currentUser.id : assignedToId === null ? null : assignedToId ? String(assignedToId) : undefined,
        closedAt: nextStatus === 'CLOSED' ? new Date() : nextStatus ? null : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
          },
        },
      },
    })

    await createNotification({
      userId: ticket.userId,
      type: 'TICKET_STATUS',
      title: 'Support ticket updated',
      message: `Your support ticket is now ${updatedTicket.status.replace(/_/g, ' ').toLowerCase()}.`,
    })

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'TICKET_UPDATED',
        entityType: 'SUPPORT_TICKET',
        entityId: ticketId,
        description: 'Admin updated a support ticket',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Support ticket updated successfully',
      ticket: updatedTicket,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update support ticket',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/tickets/:id/messages', authenticate, requireAdmin, async (req: Request, res: Response) => {
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

    const ticket = await prisma.supportTicket.findUnique({
      where: {
        id: ticketId,
      },
      select: {
        id: true,
        userId: true,
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
        isStaff: true,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
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
        status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
        assignedToId: currentUser.id,
      },
    })

    await createNotification({
      userId: ticket.userId,
      type: 'TICKET_REPLY',
      title: 'Support replied',
      message: 'An admin replied to your support ticket.',
    })

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'TICKET_MESSAGE_CREATED',
        entityType: 'SUPPORT_TICKET',
        entityId: ticketId,
        description: 'Admin replied to a support ticket',
      },
    })

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

app.patch('/posts/:id/hide', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const postId = String(req.params.id)

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        status: 'HIDDEN',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Post hidden successfully',
      post: updatedPost,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to hide post',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/posts/:id/restore', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const postId = String(req.params.id)

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    if (post.status === 'DELETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot restore a deleted post',
      })
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        status: 'ACTIVE',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Post restored successfully',
      post: updatedPost,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to restore post',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/comments/:id/hide', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const commentId = String(req.params.id)

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    if (comment.status === 'DELETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot hide a deleted comment',
      })
    }

    const updatedComment = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        status: 'HIDDEN',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Comment hidden successfully',
      comment: updatedComment,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to hide comment',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/comments/:id/restore', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const commentId = String(req.params.id)

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    if (comment.status === 'DELETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot restore a deleted comment',
      })
    }

    const updatedComment = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        status: 'VISIBLE',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Comment restored successfully',
      comment: updatedComment,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to restore comment',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/services/:id/hide', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const serviceId = String(req.params.id)

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      })
    }

    const updatedService = await prisma.service.update({
      where: {
        id: serviceId,
      },
      data: {
        status: 'HIDDEN',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Service hidden successfully',
      service: updatedService,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to hide service',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/services/:id/restore', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const serviceId = String(req.params.id)

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      })
    }

    if (service.status === 'DELETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot restore a deleted service',
      })
    }

    const updatedService = await prisma.service.update({
      where: {
        id: serviceId,
      },
      data: {
        status: 'ACTIVE',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Service restored successfully',
      service: updatedService,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to restore service',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/reviews/:id/hide', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const reviewId = String(req.params.id)

    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      })
    }

    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        status: 'HIDDEN',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Review hidden successfully',
      review: updatedReview,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to hide review',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/reviews/:id/restore', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const reviewId = String(req.params.id)

    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      })
    }

    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        status: 'VISIBLE',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Review restored successfully',
      review: updatedReview,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to restore review',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/stats', authenticate, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      totalPosts,
      activePosts,
      hiddenPosts,
      totalProviders,
      activeProviders,
      pendingProviderRequests,
      totalServices,
      activeServices,
      hiddenServices,
      totalReports,
      pendingReports,
      resolvedReports,
      totalTickets,
      openTickets,
      totalReviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          accountStatus: 'ACTIVE',
        },
      }),
      prisma.user.count({
        where: {
          accountStatus: 'BLOCKED',
        },
      }),
      prisma.post.count(),
      prisma.post.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      prisma.post.count({
        where: {
          status: 'HIDDEN',
        },
      }),
      prisma.providerProfile.count(),
      prisma.providerProfile.count({
        where: {
          providerStatus: 'ACTIVE',
        },
      }),
      prisma.providerRequest.count({
        where: {
          status: 'PENDING',
        },
      }),
      prisma.service.count(),
      prisma.service.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      prisma.service.count({
        where: {
          status: 'HIDDEN',
        },
      }),
      prisma.report.count(),
      prisma.report.count({
        where: {
          status: 'PENDING',
        },
      }),
      prisma.report.count({
        where: {
          status: 'RESOLVED',
        },
      }),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({
        where: {
          status: {
            in: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER'],
          },
        },
      }),
      prisma.review.count(),
    ])

    return res.status(200).json({
      success: true,
      message: 'Admin stats retrieved successfully',
      stats: {
        totalUsers,
        activeUsers,
        blockedUsers,
        totalPosts,
        activePosts,
        hiddenPosts,
        totalProviders,
        activeProviders,
        pendingProviderRequests,
        totalServices,
        activeServices,
        hiddenServices,
        totalReports,
        pendingReports,
        resolvedReports,
        totalTickets,
        openTickets,
        totalReviews,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/logs', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50

    const logs = await prisma.log.findMany({
      take: Math.min(limit, 100),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            profilePicturePath: true,
            role: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Logs retrieved successfully',
      logs,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve logs',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/superadmin/logs', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50

    const logs = await prisma.log.findMany({
      take: Math.min(limit, 100),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            profilePicturePath: true,
            role: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Super admin logs retrieved successfully',
      logs,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve super admin logs',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/superadmin/stats', authenticate, requireSuperAdmin, async (_req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      totalPosts,
      activePosts,
      hiddenPosts,
      totalProviders,
      activeProviders,
      pendingProviderRequests,
      totalServices,
      activeServices,
      hiddenServices,
      totalReports,
      pendingReports,
      resolvedReports,
      totalTickets,
      openTickets,
      totalReviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          accountStatus: 'ACTIVE',
        },
      }),
      prisma.user.count({
        where: {
          accountStatus: 'BLOCKED',
        },
      }),
      prisma.post.count(),
      prisma.post.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      prisma.post.count({
        where: {
          status: 'HIDDEN',
        },
      }),
      prisma.providerProfile.count(),
      prisma.providerProfile.count({
        where: {
          providerStatus: 'ACTIVE',
        },
      }),
      prisma.providerRequest.count({
        where: {
          status: 'PENDING',
        },
      }),
      prisma.service.count(),
      prisma.service.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      prisma.service.count({
        where: {
          status: 'HIDDEN',
        },
      }),
      prisma.report.count(),
      prisma.report.count({
        where: {
          status: 'PENDING',
        },
      }),
      prisma.report.count({
        where: {
          status: 'RESOLVED',
        },
      }),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({
        where: {
          status: {
            in: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER'],
          },
        },
      }),
      prisma.review.count(),
    ])

    return res.status(200).json({
      success: true,
      message: 'Super admin stats retrieved successfully',
      stats: {
        totalUsers,
        activeUsers,
        blockedUsers,
        totalPosts,
        activePosts,
        hiddenPosts,
        totalProviders,
        activeProviders,
        pendingProviderRequests,
        totalServices,
        activeServices,
        hiddenServices,
        totalReports,
        pendingReports,
        resolvedReports,
        totalTickets,
        openTickets,
        totalReviews,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve super admin stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/superadmin/categories', authenticate, requireSuperAdmin, async (_req: Request, res: Response) => {
  try {
    await ensureDefaultServiceCategories()

    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        subcategories: {
          orderBy: {
            name: 'asc',
          },
          include: {
            _count: {
              select: {
                services: true,
              },
            },
          },
        },
        _count: {
          select: {
            services: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      categories: categories.map((item) => ({
        id: item.id,
        category: item.name,
        servicesCount: item._count.services,
        subcategories: item.subcategories.map((subcategory) => subcategory.name),
        subcategoryRows: item.subcategories.map((subcategory) => ({
          id: subcategory.id,
          name: subcategory.name,
          servicesCount: subcategory._count.services,
        })),
      })),
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load categories', error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

app.post('/superadmin/categories', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { category, subcategory } = req.body
    const categoryName = String(category || '').trim()
    const subcategoryName = String(subcategory || '').trim()

    if (!categoryName) return res.status(400).json({ success: false, message: 'Category is required' })

    const categoryRecord = await prisma.category.upsert({
      where: {
        name: categoryName,
      },
      update: {},
      create: {
        name: categoryName,
      },
    })

    if (subcategoryName) {
      await prisma.subcategory.upsert({
        where: {
          categoryId_name: {
            categoryId: categoryRecord.id,
            name: subcategoryName,
          },
        },
        update: {},
        create: {
          categoryId: categoryRecord.id,
          name: subcategoryName,
        },
      })
    }

    return res.status(200).json({ success: true, message: 'Category operation completed' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create category', error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

app.patch('/superadmin/categories', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { category, subcategory, nextCategory, nextSubcategory } = req.body
    const categoryName = String(category || '').trim()
    const subcategoryName = String(subcategory || '').trim()
    const nextCategoryName = String(nextCategory || '').trim()
    const nextSubcategoryName = String(nextSubcategory || '').trim()

    if (!categoryName || !nextCategoryName) return res.status(400).json({ success: false, message: 'category and nextCategory are required' })

    const categoryRecord = await prisma.category.findUnique({
      where: {
        name: categoryName,
      },
    })

    if (!categoryRecord) return res.status(404).json({ success: false, message: 'Category not found' })

    if (subcategoryName) {
      const nextCategoryRecord = await prisma.category.upsert({
        where: {
          name: nextCategoryName,
        },
        update: {},
        create: {
          name: nextCategoryName,
        },
      })

      const subcategoryRecord = await prisma.subcategory.findUnique({
        where: {
          categoryId_name: {
            categoryId: categoryRecord.id,
            name: subcategoryName,
          },
        },
      })

      if (!subcategoryRecord) return res.status(404).json({ success: false, message: 'Subcategory not found' })

      await prisma.subcategory.update({
        where: {
          id: subcategoryRecord.id,
        },
        data: {
          categoryId: nextCategoryRecord.id,
          name: nextSubcategoryName || subcategoryName,
        },
      })

      await prisma.service.updateMany({
        where: {
          subcategoryId: subcategoryRecord.id,
        },
        data: {
          category: nextCategoryName,
          subcategory: nextSubcategoryName || subcategoryName,
          categoryId: nextCategoryRecord.id,
        },
      })
    } else {
      const updatedCategory = await prisma.category.update({
        where: {
          id: categoryRecord.id,
        },
        data: {
          name: nextCategoryName,
        },
      })

      await prisma.service.updateMany({
        where: {
          categoryId: updatedCategory.id,
        },
        data: {
          category: nextCategoryName,
        },
      })
    }

    return res.status(200).json({ success: true, message: 'Category updated' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update category', error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

app.delete('/superadmin/categories', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { category, subcategory } = req.body
    const categoryName = String(category || '').trim()
    const subcategoryName = String(subcategory || '').trim()

    if (!categoryName) return res.status(400).json({ success: false, message: 'category is required' })

    const categoryRecord = await prisma.category.findUnique({
      where: {
        name: categoryName,
      },
    })

    if (!categoryRecord) return res.status(404).json({ success: false, message: 'Category not found' })

    if (subcategoryName) {
      const subcategoryRecord = await prisma.subcategory.findUnique({
        where: {
          categoryId_name: {
            categoryId: categoryRecord.id,
            name: subcategoryName,
          },
        },
      })

      if (!subcategoryRecord) return res.status(404).json({ success: false, message: 'Subcategory not found' })

      await prisma.service.updateMany({
        where: {
          subcategoryId: subcategoryRecord.id,
        },
        data: {
          subcategoryId: null,
        },
      })

      await prisma.subcategory.delete({
        where: {
          id: subcategoryRecord.id,
        },
      })
    } else {
      await prisma.service.updateMany({
        where: {
          categoryId: categoryRecord.id,
        },
        data: {
          categoryId: null,
          subcategoryId: null,
        },
      })

      await prisma.category.delete({
        where: {
          id: categoryRecord.id,
        },
      })
    }

    return res.status(200).json({ success: true, message: 'Category deleted' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete category', error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

app.listen(PORT, () => {
  console.log(`Admin Service running on http://localhost:${PORT}`)
})
