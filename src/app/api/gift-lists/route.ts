import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateShareToken } from '@/lib/utils'
import { z } from 'zod'

const createListSchema = z.object({
  studentId: z.string(),
  titolo: z.string().min(3),
  descrizione: z.string().optional(),
  items: z.array(z.object({
    tipo: z.enum(['iscrizione', 'guida', 'esame']),
    descrizione: z.string(),
    importoTarget: z.number().positive(),
  })),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, titolo, descrizione, items } = createListSchema.parse(body)

    // Create gift list with items
    const giftList = await prisma.giftList.create({
      data: {
        studentId,
        titolo,
        descrizione: descrizione || null,
        shareToken: generateShareToken(),
        giftItems: {
          create: items,
        },
      },
      include: {
        giftItems: true,
        student: {
          select: {
            nome: true,
            cognome: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Lista regali creata',
      giftList,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/regali/${giftList.shareToken}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Create list error:', error)
    return NextResponse.json(
      { error: 'Errore durante la creazione della lista' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId richiesto' },
        { status: 400 }
      )
    }

    const giftLists = await prisma.giftList.findMany({
      where: { studentId },
      include: {
        giftItems: {
          include: {
            contributions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ giftLists })
  } catch (error) {
    console.error('Get lists error:', error)
    return NextResponse.json(
      { error: 'Errore durante il recupero delle liste' },
      { status: 500 }
    )
  }
}
