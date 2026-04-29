import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { authenticate } from './middleware/auth.middleware'
import { prisma } from './prisma'
import { generateToken } from './utils/jwt'
import { comparePassword, hashPassword } from './utils/password'
import { sanitizeUser } from './utils/sanitizeUser'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3001
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
    message: 'Auth Service is running',
    service: 'auth-service',
  })
})

app.get('/db-health', async (_req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count()

    res.status(200).json({
      success: true,
      message: 'Auth Service database connection is working',
      service: 'auth-service',
      users: userCount,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Auth Service database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/register', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, username, email, password } = req.body

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters',
      })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const normalizedUsername = String(username).trim().toLowerCase()

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
      },
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email or username already exists',
      })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
      },
    })

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: sanitizeUser(user),
      token,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    if (user.accountStatus !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'This account is not active',
      })
    }

    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      user: sanitizeUser(user),
      token,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/me', authenticate, (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Authenticated user retrieved successfully',
    user: res.locals.user,
  })
})

app.listen(PORT, () => {
  console.log(`Auth Service running on http://localhost:${PORT}`)
})
