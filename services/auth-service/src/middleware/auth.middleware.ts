import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma'
import { JwtPayload } from '../utils/jwt'
import { sanitizeUser } from '../utils/sanitizeUser'

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      })
    }

    const token = authHeader.split(' ')[1]
    const secret = process.env.JWT_SECRET

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET is not defined',
      })
    }

    const decoded = jwt.verify(token, secret) as JwtPayload

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      })
    }

    if (user.accountStatus !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'This account is not active',
      })
    }

    res.locals.user = sanitizeUser(user)
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
