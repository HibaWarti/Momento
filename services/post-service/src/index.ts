import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { prisma } from './prisma'
import { authenticate } from './middleware/auth.middleware'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3003
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
    message: 'Post Service is running',
    service: 'post-service',
  })
})

app.get('/db-health', async (_req: Request, res: Response) => {
  try {
    const postCount = await prisma.post.count()

    return res.status(200).json({
      success: true,
      message: 'Post Service database connection is working',
      service: 'post-service',
      posts: postCount,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Post Service database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const { content } = req.body

    if (!content || !String(content).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required',
      })
    }

    const post = await prisma.post.create({
      data: {
        content: String(content).trim(),
        authorId: currentUser.id,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicturePath: true,
          },
        },
        images: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
            reports: true,
          },
        },
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/', async (_req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicturePath: true,
          },
        },
        images: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
            reports: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Posts retrieved successfully',
      posts,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve posts',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})


app.get('/auth-check', authenticate, (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Post Service authentication is working',
    user: res.locals.user,
  })
})

app.get('/:id', async (req: Request, res: Response) => {
  try {
    const postId = String(req.params.id)

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicturePath: true,
          },
        },
        images: true,
        comments: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
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
        reactions: {
          select: {
            id: true,
            type: true,
            userId: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
            reports: true,
          },
        },
      },
    })

    if (!post || post.status === 'DELETED') {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    if (post.status === 'HIDDEN') {
      return res.status(403).json({
        success: false,
        message: 'This post is hidden',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Post details retrieved successfully',
      post,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve post details',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})


app.listen(PORT, () => {
  console.log(`Post Service running on http://localhost:${PORT}`)
})