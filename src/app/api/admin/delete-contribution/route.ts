import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    // Verifica autenticazione admin
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Token di autorizzazione mancante' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const contributionId = searchParams.get('contributionId')

    if (!contributionId) {
      return NextResponse.json(
        { error: 'contributionId è richiesto' },
        { status: 400 }
      )
    }

    // Verifica che il contributo sia rejected
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId }
    })

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contributo non trovato' },
        { status: 404 }
      )
    }

    if (contribution.stato !== 'rejected') {
      return NextResponse.json(
        { error: 'Solo i contributi rifiutati possono essere eliminati' },
        { status: 400 }
      )
    }

    // Elimina il contributo
    await prisma.contribution.delete({
      where: { id: contributionId }
    })

    return NextResponse.json({
      message: 'Contributo rifiutato eliminato definitivamente',
      contribution: {
        id: contribution.id,
        nome: contribution.nome,
        importo: contribution.importo
      }
    })

  } catch (error) {
    console.error('Errore eliminazione contributo:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}