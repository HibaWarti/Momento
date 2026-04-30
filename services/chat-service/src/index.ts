import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { prisma } from './prisma'
import { authenticate } from './middleware/auth.middleware'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3007
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(helmet())
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
)
app.use(morgan('dev'))
app.use(express.json())

app.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Chat Service is running',
    service: 'chat-service',
  })
})

app.get('/db-health', async (_req: Request, res: Response) => {
  try {
    const conversationCount = await prisma.conversation.count()
    const messageCount = await prisma.message.count()

    return res.status(200).json({
      success: true,
      message: 'Chat Service database connection is working',
      service: 'chat-service',
      conversations: conversationCount,
      messages: messageCount,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Chat Service database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/auth-check', authenticate, (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Chat Service authentication is working',
    user: res.locals.user,
  })
})

app.listen(PORT, () => {
  console.log(`Chat Service running on port ${PORT}`)
})