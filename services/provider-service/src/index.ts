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

app.get('/requests/me', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }

    const providerRequests = await prisma.providerRequest.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Provider requests retrieved successfully',
      providerRequests,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve provider requests',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/', async (_req: Request, res: Response) => {
  try {
    const providers = await prisma.providerProfile.findMany({
      where: {
        providerStatus: 'ACTIVE',
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
            bio: true,
          },
        },
        _count: {
          select: {
            services: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Providers retrieved successfully',
      providers,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve providers',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/me/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string; role?: string }

    if (currentUser.role !== 'PROVIDER') {
      return res.status(403).json({
        success: false,
        message: 'Provider access required',
      })
    }

    const providerProfile = await prisma.providerProfile.findUnique({
      where: {
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
            bio: true,
          },
        },
        _count: {
          select: {
            services: true,
          },
        },
      },
    })

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Current provider profile retrieved successfully',
      providerProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve current provider profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.patch('/me/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string; role?: string }
    const { professionalName, professionalDescription, phone, city } = req.body

    if (currentUser.role !== 'PROVIDER') {
      return res.status(403).json({
        success: false,
        message: 'Provider access required',
      })
    }

    if (
      professionalName === undefined &&
      professionalDescription === undefined &&
      phone === undefined &&
      city === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required',
      })
    }

    const providerProfile = await prisma.providerProfile.findUnique({
      where: {
        userId: currentUser.id,
      },
      select: {
        id: true,
      },
    })

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
      })
    }

    const updateData: {
      professionalName?: string
      professionalDescription?: string
      phone?: string
      city?: string
    } = {}

    if (professionalName !== undefined) {
      updateData.professionalName = String(professionalName).trim()
    }
    if (professionalDescription !== undefined) {
      updateData.professionalDescription = String(professionalDescription).trim()
    }
    if (phone !== undefined) {
      updateData.phone = String(phone).trim()
    }
    if (city !== undefined) {
      updateData.city = String(city).trim()
    }

    const updatedProfile = await prisma.providerProfile.update({
      where: {
        userId: currentUser.id,
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicturePath: true,
            bio: true,
          },
        },
        _count: {
          select: {
            services: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Provider profile updated successfully',
      providerProfile: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update provider profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/services', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string }
    const { title, description, price, city, category } = req.body

    if (!title || !description || !city || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, city, and category are required',
      })
    }

    const providerProfile = await prisma.providerProfile.findUnique({
      where: {
        userId: currentUser.id,
      },
      select: {
        id: true,
        providerStatus: true,
      },
    })

    if (!providerProfile || providerProfile.providerStatus !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Active provider profile is required',
      })
    }

    const parsedPrice =
      price !== undefined && price !== null && String(price).trim() !== ''
        ? Number(price)
        : null

    if (parsedPrice !== null && Number.isNaN(parsedPrice)) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid number',
      })
    }

    const service = await prisma.service.create({
      data: {
        providerProfileId: providerProfile.id,
        title: String(title).trim(),
        description: String(description).trim(),
        price: parsedPrice,
        city: String(city).trim(),
        category: String(category).trim(),
      },
      include: {
        providerProfile: {
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
        images: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/services', async (_req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        providerProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicturePath: true,
                bio: true,
              },
            },
          },
        },
        images: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Services retrieved successfully',
      services,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve services',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/services/:id', async (req: Request, res: Response) => {
  try {
    const serviceId = String(req.params.id)

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        providerProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicturePath: true,
                bio: true,
              },
            },
          },
        },
        images: true,
        reviews: {
          where: {
            status: 'VISIBLE',
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
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    })

    if (!service || service.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Service details retrieved successfully',
      service,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve service details',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/me/services', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user as { id: string; role?: string }

    if (currentUser.role !== 'PROVIDER') {
      return res.status(403).json({
        success: false,
        message: 'Provider access required',
      })
    }

    const providerProfile = await prisma.providerProfile.findUnique({
      where: {
        userId: currentUser.id,
      },
      select: {
        id: true,
      },
    })

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
      })
    }

    const services = await prisma.service.findMany({
      where: {
        providerProfileId: providerProfile.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        images: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Current provider services retrieved successfully',
      services,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve current provider services',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/:id', async (req: Request, res: Response) => {
  try {
    const providerId = String(req.params.id)

    const provider = await prisma.providerProfile.findUnique({
      where: {
        id: providerId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicturePath: true,
            bio: true,
          },
        },
        services: {
          where: {
            status: 'ACTIVE',
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
        _count: {
          select: {
            services: true,
          },
        },
      },
    })

    if (!provider || provider.providerStatus === 'SUSPENDED') {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Provider profile retrieved successfully',
      provider,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve provider profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Provider Service running on http://localhost:${PORT}`)
})
