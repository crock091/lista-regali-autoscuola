import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateShareToken(): string {
  return nanoid(16)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function calculateProgress(raccolto: number, target: number): number {
  if (target === 0) return 0
  return Math.min(Math.round((raccolto / target) * 100), 100)
}
