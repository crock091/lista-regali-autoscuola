import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Log della connessione
console.log('🔌 Prisma Client - Database URL:', process.env.DATABASE_URL ? 'Configured ✅' : 'Missing ❌')
console.log('🌍 Environment:', process.env.NODE_ENV)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
