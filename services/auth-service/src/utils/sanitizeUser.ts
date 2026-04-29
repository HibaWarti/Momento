type UserWithPassword = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  password?: string
  profilePicturePath?: string | null
  bio?: string | null
  role: string
  accountStatus: string
  createdAt: Date
  updatedAt: Date
}

export const sanitizeUser = (user: UserWithPassword) => {
  const { password, ...safeUser } = user
  return safeUser
}
