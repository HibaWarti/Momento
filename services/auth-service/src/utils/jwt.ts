import jwt from 'jsonwebtoken'

type TokenUser = {
  id: string
  email: string
  role: string
}

export const generateToken = (user: TokenUser): string => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    {
      expiresIn: (process.env.JWT_EXPIRES_IN ||
        '7d') as jwt.SignOptions['expiresIn'],
    },
  )
}

export type JwtPayload = {
  userId: string
  email: string
  role: string
}
