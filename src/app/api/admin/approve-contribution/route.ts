import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
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

    // Verifica del token admin (dovrebbe essere fatto con JWT, ma per ora controlliamo solo che esista)
    // In produzione implementare verifica JWT appropriata

    const body = await request.json()
    const { contributionId, action, reason } = body

    if (!contributionId || !action) {
      return NextResponse.json(
        { error: 'contributionId e action sono richiesti' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action deve essere approve o reject' },
        { status: 400 }
      )
    }

    // Trova il contributo
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId },
      include: {
        giftItem: {
          include: {
            giftList: true
          }
        }
      }
    })

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contributo non trovato' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Approva il contributo
      const updatedContribution = await prisma.contribution.update({
        where: { id: contributionId },
        data: {
          stato: 'completed'
        }
      })

      // Aggiorna l'importo raccolto nel gift item
      await prisma.giftItem.update({
        where: { id: contribution.giftItemId },
        data: {
          importoRaccolto: {
            increment: contribution.importo
          }
        }
      })

      return NextResponse.json({
        message: 'Contributo approvato con successo',
        contribution: updatedContribution
      })
    } else {
      // Rifiuta il contributo
      const updatedContribution = await prisma.contribution.update({
        where: { id: contributionId },
        data: {
          stato: 'rejected',
          note: reason || 'Rifiutato dall\'amministratore'
        }
      })

      return NextResponse.json({
        message: 'Contributo rifiutato',
        contribution: updatedContribution
      })
    }
  } catch (error) {
    console.error('Errore approvazione contributo:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}