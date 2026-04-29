import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { prisma } from './prisma'

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

app.listen(PORT, () => {
  console.log(`User Service running on http://localhost:${PORT}`)
})