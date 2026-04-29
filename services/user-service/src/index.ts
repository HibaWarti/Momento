import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { prisma } from './prisma'
import { authenticate } from './middleware/auth.middleware'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3002
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



app.listen(PORT, () => {
  console.log(`User Service running on http://localhost:${PORT}`)
})
