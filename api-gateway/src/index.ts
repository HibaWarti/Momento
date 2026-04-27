import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { createProxyMiddleware } from 'http-proxy-middleware'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001'
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002'
const POST_SERVICE_URL = process.env.POST_SERVICE_URL || 'http://localhost:3003'
const PROVIDER_SERVICE_URL = process.env.PROVIDER_SERVICE_URL || 'http://localhost:3004'
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://localhost:3005'
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006'

app.use(helmet())
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
)
app.use(morgan('dev'))

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API Gateway is running',
    service: 'api-gateway',
  })
})

app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '',
    },
  }),
)

app.use(
  '/api/users',
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/users': '',
    },
  }),
)

app.use(
  '/api/posts',
  createProxyMiddleware({
    target: POST_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/posts': '',
    },
  }),
)

app.use(
  '/api/providers',
  createProxyMiddleware({
    target: PROVIDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/providers': '',
    },
  }),
)

app.use(
  '/api/admin',
  createProxyMiddleware({
    target: ADMIN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/admin': '',
    },
  }),
)

app.use(
  '/api/notifications',
  createProxyMiddleware({
    target: NOTIFICATION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/notifications': '',
    },
  }),
)