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

app.listen(PORT, () => {
  console.log(`User Service running on http://localhost:${PORT}`)
})