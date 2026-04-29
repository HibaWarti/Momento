import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { prisma } from './prisma'
import { authenticate } from './middleware/auth.middleware'

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

app.get('/auth-check', authenticate, (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Provider Service authentication is working',
    user: res.locals.user,
  })
})

app.post('/requests', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string; role?: string }
    const {
      professionalName,
      professionalDescription,
      phone,
      city,
      cinNumber,
      cinPicturePath,
      additionalInfo,
    } = req.body

    if (
      !professionalName ||
      !professionalDescription ||
      !phone ||
      !city ||
      !cinNumber ||
      !cinPicturePath
    ) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      })
    }

    if (currentUser.role === 'PROVIDER') {
      return res.status(400).json({
        success: false,
        message: 'You are already a provider',
      })
    }

    const existingPendingRequest = await prisma.providerRequest.findFirst({
      where: {
        userId: currentUser.id,
        status: {
          in: ['PENDING', 'REVIEWING'],
        },
      },
      select: {
        id: true,
      },
    })

    if (existingPendingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending provider request',
      })
    }

    const providerRequest = await prisma.providerRequest.create({
      data: {
        userId: currentUser.id,
        professionalName: String(professionalName).trim(),
        professionalDescription: String(professionalDescription).trim(),
        phone: String(phone).trim(),
        city: String(city).trim(),
        cinNumber: String(cinNumber).trim(),
        cinPicturePath: String(cinPicturePath).trim(),
        additionalInfo:
          additionalInfo !== undefined && additionalInfo !== null
            ? String(additionalInfo).trim()
            : null,
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Provider request submitted successfully',
      providerRequest,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit provider request',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Provider Service running on http://localhost:${PORT}`)
})
