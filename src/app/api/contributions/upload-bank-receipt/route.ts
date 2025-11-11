import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContributorPendingNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const contributionId = formData.get('contributionId') as string
    const file = formData.get('contabile-pdf') as File

    if (!contributionId || !file) {
      return NextResponse.json(
        { error: 'Contribution ID e file PDF sono richiesti' },
        { status: 400 }
      )
    }

    // Verifica che sia un PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Solo file PDF sono accettati' },
        { status: 400 }
      )
    }

    // Verifica dimensione file (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Il file deve essere inferiore a 5MB' },
        { status: 400 }
      )
    }

    // Verifica che il contributo esista
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId },
      include: {
        giftItem: {
          include: {
            giftList: {
              include: {
                student: true
              }
            }
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

    // Converti file in Base64 per storage Vercel-compatible
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString('base64');

    // Aggiorna il contributo con Base64 storage
    const updatedContribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: {
        bonificoBase64: base64Content,
        bonificoName: file.name,
        stato: 'pending_verification'
      }
    })

    // Invia email di conferma al donatore se ha fornito l'email
    if (contribution.email) {
      try {
        const student = contribution.giftItem.giftList.student;
        await sendContributorPendingNotification(
          contribution.email,
          contribution.nome,
          contribution.importo,
          contribution.giftItem.descrizione,
          `${student.nome} ${student.cognome}`,
          contribution.metodoPagamento
        );
      } catch (emailError) {
        console.error('❌ Errore invio email pending al donatore:', emailError);
        // Non blocchiamo l'upload per errori email
      }
    }

    return NextResponse.json({
      message: 'File caricato con successo e salvato nel database',
      contribution: updatedContribution
    })

  } catch (error) {
    console.error('Errore upload contabile:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}