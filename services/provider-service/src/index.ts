import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { prisma } from './prisma'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3004
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
    message: 'Provider Service is running',
    service: 'provider-service',
  })
})

app.get('/db-health', async (_req: Request, res: Response) => {
  try {
    const providerProfileCount = await prisma.providerProfile.count()

    return res.status(200).json({
      success: true,
      message: 'Provider Service database connection is working',
      service: 'provider-service',
      providerProfiles: providerProfileCount,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Provider Service database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Provider Service running on http://localhost:${PORT}`)
})
