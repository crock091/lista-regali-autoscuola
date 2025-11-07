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
    // TODO: Implementare autenticazione reale
    // Per ora usiamo dati mock se non ci sono utenti nel database
    
    const studentsCount = await prisma.student.count()
    
    if (studentsCount === 0) {
      // Nessun utente registrato, restituiamo dati mock
      return NextResponse.json({
        student: {
          id: 'mock',
          nome: 'Demo',
          cognome: 'User', 
          email: 'demo@example.com'
        },
        giftLists: [],
        totalRaised: 0,
        totalContributions: 0
      })
    }

    // Prendi il primo studente per demo (in futuro sarà dall'autenticazione)
    const student = await prisma.student.findFirst({
      include: {
        giftLists: {
          include: {
            giftItems: {
              include: {
                contributions: {
                  where: { stato: 'completed' }
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Nessun utente trovato' },
        { status: 404 }
      )
    }

    // Calcola totali
    let totalRaised = 0
    let totalContributions = 0

    student.giftLists.forEach((list: any) => {
      list.giftItems.forEach((item: any) => {
        totalRaised += item.importoRaccolto
        totalContributions += item.contributions.length
      })
    })

    return NextResponse.json({
      student: {
        id: student.id,
        nome: student.nome,
        cognome: student.cognome,
        email: student.email
      },
      giftLists: student.giftLists,
      totalRaised,
      totalContributions
    })

  } catch (error) {
    console.error('Get dashboard error:', error)
    return NextResponse.json(
      { error: 'Errore durante il recupero dei dati' },
      { status: 500 }
    )
  }
}
