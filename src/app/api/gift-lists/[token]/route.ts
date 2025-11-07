import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    const giftList = await prisma.giftList.findUnique({
      where: { shareToken: token, attiva: true },
      include: {
        student: {
          select: {
            nome: true,
            cognome: true,
          },
        },
        giftItems: {
          include: {
            contributions: {
              where: { stato: 'completed' },
              select: {
                nome: true,
                importo: true,
                messaggio: true,
                dataContributo: true,
              },
            },
          },
        },
      },
    })

    if (!giftList) {
      return NextResponse.json(
        { error: 'Lista regali non trovata' },
        { status: 404 }
      )
    }

    return NextResponse.json({ giftList })
  } catch (error) {
    console.error('Get shared list error:', error)
    return NextResponse.json(
      { error: 'Errore durante il recupero della lista' },
      { status: 500 }
    )
  }
}
