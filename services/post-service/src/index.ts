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

app.patch('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const postId = String(req.params.id)
    const { content } = req.body

    if (content === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required',
      })
    }

    const trimmedContent = String(content).trim()

    if (!trimmedContent) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required',
      })
    }

    const existingPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        authorId: true,
        status: true,
      },
    })

    if (
      !existingPost ||
      existingPost.status === 'DELETED' ||
      existingPost.status === 'HIDDEN'
    ) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    if (existingPost.authorId !== currentUser.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts',
      })
    }

    const post = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        content: trimmedContent,
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
      message: 'Post updated successfully',
      post,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const postId = String(req.params.id)

    const existingPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        authorId: true,
        status: true,
      },
    })

    if (!existingPost || existingPost.status === 'DELETED') {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    if (existingPost.authorId !== currentUser.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts',
      })
    }

    await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        status: 'DELETED',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/:id/comments', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const postId = String(req.params.id)
    const { content } = req.body

    if (!content || !String(content).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      })
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        status: true,
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
        message: 'Cannot comment on this post',
      })
    }

    const comment = await prisma.comment.create({
      data: {
        content: String(content).trim(),
        postId,
        userId: currentUser.id,
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
    })

    return res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      comment,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create comment',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/:id/comments', async (req: Request, res: Response) => {
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

    const comments = await prisma.comment.findMany({
      where: {
        postId,
      },
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
    })

    return res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      comments,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve comments',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.delete(
  '/comments/:commentId',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const currentUser = res.locals.user as { id: string }
      const commentId = String(req.params.commentId)

      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
        select: {
          id: true,
          userId: true,
          post: {
            select: {
              authorId: true,
            },
          },
        },
      })

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found',
        })
      }

      const canDelete =
        comment.userId === currentUser.id || comment.post.authorId === currentUser.id

      if (!canDelete) {
        return res.status(403).json({
          success: false,
          message: 'You are not allowed to delete this comment',
        })
      }

      await prisma.comment.delete({
        where: {
          id: commentId,
        },
      })

      return res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },
)

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
