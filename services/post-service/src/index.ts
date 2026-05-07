import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import crypto from 'crypto'
import { prisma } from './prisma'
import { authenticate } from './middleware/auth.middleware'
import { postImageUpload } from './utils/upload'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3003
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const allowedOrigins = new Set([
  FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
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

const commentUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  profilePicturePath: true,
  role: true,
  providerRequests: {
    where: {
      status: 'APPROVED',
    },
    select: {
      status: true,
    },
  },
} as const

const commentInclude = {
  user: {
    select: commentUserSelect,
  },
  replies: {
    where: {
      status: 'VISIBLE',
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      user: {
        select: commentUserSelect,
      },
    },
  },
} as const

type CommentWithReplies = {
  id: string
  reactions?: Array<{ id: string; type: string; userId: string; commentId: string; createdAt: Date }>
  replies?: CommentWithReplies[]
}

function collectCommentIds(comments: CommentWithReplies[] = []): string[] {
  return comments.flatMap((comment) => [comment.id, ...collectCommentIds(comment.replies ?? [])])
}

async function attachCommentReactionsToComments<T extends CommentWithReplies[]>(comments: T): Promise<T> {
  const ids = collectCommentIds(comments)
  if (!ids.length) return comments

  const reactions = await prisma.$queryRawUnsafe<Array<{ id: string; type: string; userId: string; commentId: string; createdAt: Date }>>(
    'SELECT id, type, "userId", "commentId", "createdAt" FROM "CommentReaction" WHERE "commentId" = ANY($1)',
    ids,
  )
  const reactionsByComment = new Map<string, typeof reactions>()
  reactions.forEach((reaction) => {
    reactionsByComment.set(reaction.commentId, [...(reactionsByComment.get(reaction.commentId) ?? []), reaction])
  })

  const apply = (items: CommentWithReplies[]) => {
    items.forEach((comment) => {
      comment.reactions = reactionsByComment.get(comment.id) ?? []
      apply(comment.replies ?? [])
    })
  }
  apply(comments)
  return comments
}

async function attachCommentReactionsToPosts<T extends { comments?: CommentWithReplies[] }>(posts: T[]): Promise<T[]> {
  await attachCommentReactionsToComments(posts.flatMap((post) => post.comments ?? []))
  return posts
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
            role: true,
            providerRequests: {
              where: {
                status: 'APPROVED',
              },
              select: {
                status: true,
              },
            },
          },
        },
        images: true,
        comments: {
          where: {
            status: 'VISIBLE',
            parentId: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: commentInclude,
        },
        reactions: {
          select: {
            id: true,
            type: true,
            userId: true,
            postId: true,
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

    const [postWithCommentReactions] = await attachCommentReactionsToPosts([post])

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: postWithCommentReactions,
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
            role: true,
            providerRequests: {
              where: {
                status: 'APPROVED',
              },
              select: {
                status: true,
              },
            },
          },
        },
        images: true,
        comments: {
          where: {
            status: 'VISIBLE',
            parentId: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: commentInclude,
        },
        reactions: {
          select: {
            id: true,
            type: true,
            userId: true,
            postId: true,
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

    const postsWithCommentReactions = await attachCommentReactionsToPosts(posts)

    return res.status(200).json({
      success: true,
      message: 'Posts retrieved successfully',
      posts: postsWithCommentReactions,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve posts',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/saved/me', authenticate, async (_req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }

    const savedPosts = await prisma.savedPost.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicturePath: true,
                role: true,
                providerRequests: {
                  where: {
                    status: 'APPROVED',
                  },
                  select: {
                    status: true,
                  },
                },
              },
            },
            images: true,
            reactions: {
              select: {
                id: true,
                type: true,
                userId: true,
                postId: true,
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
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Saved posts retrieved successfully',
      savedPosts,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve saved posts',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/:id/save', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
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

    if (!post || post.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const savedPost = await prisma.savedPost.upsert({
      where: {
        userId_postId: {
          userId: currentUser.id,
          postId,
        },
      },
      update: {},
      create: {
        userId: currentUser.id,
        postId,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Post saved successfully',
      savedPost,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save post',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.delete('/:id/save', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const postId = String(req.params.id)

    await prisma.savedPost.deleteMany({
      where: {
        userId: currentUser.id,
        postId,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Post removed from saved items',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to unsave post',
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
            role: true,
            providerRequests: {
              where: {
                status: 'APPROVED',
              },
              select: {
                status: true,
              },
            },
          },
        },
        images: true,
        reactions: {
          select: {
            id: true,
            type: true,
            userId: true,
            postId: true,
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
    const { content, parentId } = req.body

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
        authorId: true,
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

    let rootParentId: string | null = null

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: {
          id: String(parentId),
        },
        select: {
          id: true,
          postId: true,
          parentId: true,
          status: true,
        },
      })

      if (!parentComment || parentComment.postId !== postId || parentComment.status !== 'VISIBLE') {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found',
        })
      }

      rootParentId = parentComment.parentId || parentComment.id
    }

    const comment = await prisma.comment.create({
      data: {
        content: String(content).trim(),
        postId,
        userId: currentUser.id,
        parentId: rootParentId,
      },
      include: commentInclude,
    })

    if (post.authorId !== currentUser.id) {
      await createNotification({
        userId: post.authorId,
        type: 'COMMENT',
        title: 'New comment',
        message: `${comment.user.firstName} ${comment.user.lastName} ${rootParentId ? 'replied to a comment on' : 'commented on'} your post.`,
      })
    }

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
        authorId: true,
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
        status: 'VISIBLE',
        parentId: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: commentInclude,
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

app.patch('/comments/:commentId', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const commentId = String(req.params.commentId)
    const { content } = req.body

    if (!content || !String(content).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      })
    }

    const existingComment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    })

    if (!existingComment || existingComment.status === 'DELETED') {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    if (existingComment.userId !== currentUser.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments',
      })
    }

    const comment = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content: String(content).trim(),
      },
      include: commentInclude,
    })

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      comment,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update comment',
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

      await prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          status: 'DELETED',
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

app.post('/comments/:commentId/reports', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const commentId = String(req.params.commentId)
    const { reason, description } = req.body

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required',
      })
    }

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        userId: true,
        status: true,
        post: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    if (!comment || comment.status === 'DELETED' || comment.post.status === 'DELETED') {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    if (comment.status === 'HIDDEN' || comment.post.status === 'HIDDEN') {
      return res.status(403).json({
        success: false,
        message: 'This comment cannot be reported',
      })
    }

    if (comment.userId === currentUser.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report your own comment',
      })
    }

    const report = await prisma.report.create({
      data: {
        reporterId: currentUser.id,
        commentId,
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
        entityType: 'COMMENT',
        entityId: commentId,
        description: `Comment report created: ${String(reason).trim()}`,
      },
    })

    await notifyAdmins('New comment report', 'A user reported a comment for moderation review.')

    return res.status(201).json({
      success: true,
      message: 'Comment reported successfully',
      report,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to report comment',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/comments/:commentId/reactions', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const commentId = String(req.params.commentId)
    const { type } = req.body
    const reactionType = String(type || 'LIKE').trim().toUpperCase()

    if (!['LIKE', 'LOVE', 'WOW', 'HAHA', 'SAD', 'ANGRY'].includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type',
      })
    }

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        userId: true,
        status: true,
        post: {
          select: {
            status: true,
          },
        },
      },
    })

    if (!comment || comment.status !== 'VISIBLE' || comment.post.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO "CommentReaction" ("id", "type", "commentId", "userId", "createdAt")
       VALUES ($1, $2::"ReactionType", $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT ("commentId", "userId") DO UPDATE SET "type" = EXCLUDED."type"`,
      crypto.randomUUID(),
      reactionType,
      commentId,
      currentUser.id,
    )

    const [reaction] = await prisma.$queryRawUnsafe<Array<{ id: string; type: string; userId: string; commentId: string; createdAt: Date }>>(
      'SELECT id, type, "userId", "commentId", "createdAt" FROM "CommentReaction" WHERE "commentId" = $1 AND "userId" = $2',
      commentId,
      currentUser.id,
    )

    if (comment.userId !== currentUser.id) {
      await createNotification({
        userId: comment.userId,
        type: 'LIKE',
        title: 'Comment like',
        message: 'Someone liked your comment.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Comment reaction saved successfully',
      reaction,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save comment reaction',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.delete('/comments/:commentId/reactions', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const commentId = String(req.params.commentId)

    await prisma.$executeRawUnsafe('DELETE FROM "CommentReaction" WHERE "commentId" = $1 AND "userId" = $2', commentId, currentUser.id)

    return res.status(200).json({
      success: true,
      message: 'Comment reaction removed successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to remove comment reaction',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

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
        authorId: true,
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

    const existingReaction = await prisma.reaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: currentUser.id,
        },
      },
      select: {
        id: true,
        type: true,
      },
    })

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

    if (!existingReaction && post.authorId !== currentUser.id) {
      const reactor = await prisma.user.findUnique({
        where: {
          id: currentUser.id,
        },
        select: {
          firstName: true,
          lastName: true,
        },
      })

      await createNotification({
        userId: post.authorId,
        type: 'LIKE',
        title: 'New reaction',
        message: `${reactor?.firstName ?? 'Someone'} ${reactor?.lastName ?? ''} reacted to your post.`.trim(),
      })
    }

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

    await prisma.log.create({
      data: {
        actorId: currentUser.id,
        action: 'REPORT_CREATED',
        entityType: 'POST',
        entityId: postId,
        description: `Post report created: ${String(reason).trim()}`,
      },
    })

    await notifyAdmins('New post report', 'A user reported a post for moderation review.')

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
            role: true,
            providerRequests: {
              where: {
                status: 'APPROVED',
              },
              select: {
                status: true,
              },
            },
          },
        },
        images: true,
        comments: {
          where: {
            status: 'VISIBLE',
            parentId: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: commentInclude,
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

    const [postWithCommentReactions] = await attachCommentReactionsToPosts([post])

    return res.status(200).json({
      success: true,
      message: 'Post details retrieved successfully',
      post: postWithCommentReactions,
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
