import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Log della connessione
console.log('🔌 Prisma Client - Database URL:', process.env.DATABASE_URL ? 'Configured ✅' : 'Missing ❌')
console.log('🌍 Environment:', process.env.NODE_ENV)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Test connessione al primo utilizzo
prisma.$connect().then(() => {
  console.log('✅ Prisma connected to database')
}).catch((error) => {
  console.error('❌ Prisma connection failed:', error)
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
