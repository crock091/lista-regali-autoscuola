import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/utils'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nome: z.string().min(2),
  cognome: z.string().min(2),
  telefono: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, nome, cognome, telefono } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.student.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email già registrata' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create student
    const student = await prisma.student.create({
      data: {
        email,
        password: hashedPassword,
        nome,
        cognome,
        telefono: telefono || null,
      },
    })

    return NextResponse.json({
      message: 'Registrazione completata',
      student: {
        id: student.id,
        email: student.email,
        nome: student.nome,
        cognome: student.cognome,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Errore durante la registrazione' },
      { status: 500 }
    )
  }
}
