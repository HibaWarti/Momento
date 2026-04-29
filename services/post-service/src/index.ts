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

app.get('/auth-check', authenticate, (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Post Service authentication is working',
    user: res.locals.user,
  })
})


app.listen(PORT, () => {
  console.log(`Post Service running on http://localhost:${PORT}`)
})