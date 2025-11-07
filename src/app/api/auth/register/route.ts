import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateShareToken } from '@/lib/utils'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nome: z.string().min(2),
  cognome: z.string().min(2),
  telefono: z.string().optional(),
  categoriaPatente: z.enum(['AM', 'A1', 'A2', 'A3', 'B']).default('B'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, nome, cognome, telefono, categoriaPatente } = registerSchema.parse(body)

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
        categoriaPatente,
      },
    })

    // Costi automatici basati sulla categoria
    const costiCategorie: { [key: string]: { iscrizione: number, oreMinime: number } } = {
      'AM': { iscrizione: 300, oreMinime: 6 },
      'A1': { iscrizione: 400, oreMinime: 6 },
      'A2': { iscrizione: 500, oreMinime: 6 },
      'A3': { iscrizione: 600, oreMinime: 6 },
      'B': { iscrizione: 500, oreMinime: 6 }
    }

    const costi = costiCategorie[categoriaPatente]
    const costoGuide = costi.oreMinime * 50 // 50€ per ora

    // Crea automaticamente la lista regali per la patente
    await prisma.giftList.create({
      data: {
        studentId: student.id,
        titolo: `La mia Patente ${categoriaPatente} 🚗`,
        descrizione: `Aiutami a realizzare il sogno di guidare con la patente ${categoriaPatente}!`,
        shareToken: generateShareToken(),
        giftItems: {
          create: [
            {
              tipo: 'iscrizione',
              descrizione: `Iscrizione corso patente ${categoriaPatente}`,
              importoTarget: costi.iscrizione,
              importoRaccolto: 0,
            },
            {
              tipo: 'guida',
              descrizione: `ore di guida pratica`,
              importoTarget: costoGuide,
              importoRaccolto: 0,
            }
          ]
        }
      }
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
