import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { prisma } from './prisma'
import { authenticate } from './middleware/auth.middleware'
import { requireAdmin, requireSuperAdmin } from './middleware/role.middleware'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3005
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

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
    const users = await prisma.user.findMany({
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
          },
        },
      },
    })

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
        providerRequests: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            providerRequests: true,
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

    return res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      user,
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

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        id: true,
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
        status: 'RESOLVED',
        reviewedAt: new Date(),
        reviewedById: currentUser.id,
      },
    })

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

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        id: true,
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
        reviewedAt: new Date(),
        reviewedById: currentUser.id,
      },
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

app.listen(PORT, () => {
  console.log(`Admin Service running on http://localhost:${PORT}`)
})
