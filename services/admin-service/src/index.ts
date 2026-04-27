import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3005
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
    message: 'Admin Service is running',
    service: 'admin-service',
  })
})

app.listen(PORT, () => {
  console.log(`Admin Service running on http://localhost:${PORT}`)
})