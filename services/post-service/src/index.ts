import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { prisma } from './prisma'
import { authenticate } from './middleware/auth.middleware'
import { postImageUpload } from './utils/upload'

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

app.get('/auth-check', authenticate, (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Post Service authentication is working',
    user: res.locals.user,
  })
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

app.post('/:id/reactions', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const postId = String(req.params.id)
    const { type } = req.body

    const allowedReactionTypes = ['LIKE', 'LOVE', 'WOW', 'HAHA', 'SAD', 'ANGRY']
    const reactionType = String(type).trim().toUpperCase()

    if (!allowedReactionTypes.includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type',
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
        message: 'Cannot react to this post',
      })
    }

    const reaction = await prisma.reaction.upsert({
      where: {
        postId_userId: {
          postId,
          userId: currentUser.id,
        },
      },
      update: {
        type: reactionType as
          | 'LIKE'
          | 'LOVE'
          | 'WOW'
          | 'HAHA'
          | 'SAD'
          | 'ANGRY',
      },
      create: {
        postId,
        userId: currentUser.id,
        type: reactionType as
          | 'LIKE'
          | 'LOVE'
          | 'WOW'
          | 'HAHA'
          | 'SAD'
          | 'ANGRY',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Reaction saved successfully',
      reaction,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save reaction',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.delete('/:id/reactions', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const postId = String(req.params.id)

    const existingReaction = await prisma.reaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: currentUser.id,
        },
      },
      select: {
        id: true,
      },
    })

    if (!existingReaction) {
      return res.status(404).json({
        success: false,
        message: 'Reaction not found',
      })
    }

    await prisma.reaction.delete({
      where: {
        postId_userId: {
          postId,
          userId: currentUser.id,
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Reaction removed successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to remove reaction',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/:id/reports', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const postId = String(req.params.id)
    const { reason, description } = req.body

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required',
      })
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        authorId: true,
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
        message: 'This post cannot be reported',
      })
    }

    if (post.authorId === currentUser.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report your own post',
      })
    }

    const report = await prisma.report.create({
      data: {
        reporterId: currentUser.id,
        postId,
        reason: String(reason).trim(),
        description:
          description !== undefined && description !== null
            ? String(description).trim()
            : null,
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Post reported successfully',
      report,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to report post',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
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

app.post('/:id/images', authenticate, (req: Request, res: Response) => {
  postImageUpload.array('images', 5)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : 'File upload failed',
      })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required',
      })
    }

    try {
      const currentUser = res.locals.user as { id: string }
      const postId = String(req.params.id)

      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          id: true,
          authorId: true,
          status: true,
        },
      })

      if (!post || post.status === 'DELETED') {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
        })
      }

      if (post.authorId !== currentUser.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only upload images to your own posts',
        })
      }

      const imageFiles = req.files as Express.Multer.File[]
      const postImagesData = imageFiles.map((file) => ({
        imagePath: `/uploads/posts/${file.filename}`,
        postId,
      }))

      const createdImages = await prisma.postImage.createManyAndReturn({
        data: postImagesData,
      })

      return res.status(201).json({
        success: true,
        message: 'Post images uploaded successfully',
        images: createdImages,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload post images',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })
})

app.delete('/:id/images/:imageId', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const postId = String(req.params.id)
    const imageId = String(req.params.imageId)

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        authorId: true,
      },
    })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    if (post.authorId !== currentUser.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete images from your own posts',
      })
    }

    await prisma.postImage.delete({
      where: {
        id: imageId,
        postId,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Post image deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete post image',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Post Service running on http://localhost:${PORT}`)
})
