import { NextFunction, Request, Response } from 'express'

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = res.locals.user as { id: string; role: string }

    if (!['ADMIN', 'SUPERADMIN'].includes(currentUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      })
    }

    next()
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    })
  }
}

export const requireSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = res.locals.user as { id: string; role: string }

    if (currentUser.role !== 'SUPERADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Super admin access required',
      })
    }

    next()
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required',
    })
  }
}
