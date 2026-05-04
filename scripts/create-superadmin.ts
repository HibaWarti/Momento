import dotenv from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../database/generated/prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

dotenv.config()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function createSuperAdmin() {
  try {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error('DATABASE_URL is not defined in .env file')
      process.exit(1)
    }

    const adapter = new PrismaPg({ connectionString })
    const prisma = new PrismaClient({ adapter })

    console.log('\n=== Create Super Admin User ===\n')

    const firstName = await question('First Name: ')
    const lastName = await question('Last Name: ')
    const username = await question('Username: ')
    const email = await question('Email: ')
    const password = await question('Password: ')

    // Validate inputs
    if (!firstName || !lastName || !username || !email || !password) {
      console.error('\nError: All fields are required')
      rl.close()
      process.exit(1)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    })

    if (existingUser) {
      console.error('\nError: User with this email or username already exists')
      rl.close()
      process.exit(1)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create superadmin user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        role: 'SUPERADMIN',
        accountStatus: 'ACTIVE',
      },
    })

    console.log('\n Super admin user created successfully!')
    console.log(`ID: ${user.id}`)
    console.log(`Name: ${user.firstName} ${user.lastName}`)
    console.log(`Username: ${user.username}`)
    console.log(`Email: ${user.email}`)
    console.log(`Role: ${user.role}`)

    await prisma.$disconnect()
    rl.close()
  } catch (error) {
    console.error('\nError creating super admin:', error)
    rl.close()
    process.exit(1)
  }
}

createSuperAdmin()
