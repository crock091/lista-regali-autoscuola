import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const confirmTransferSchema = z.object({
  contributionId: z.string(),
  contabile: z.string().min(5, 'Il numero di contabile deve essere di almeno 5 caratteri'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contributionId, contabile } = confirmTransferSchema.parse(body);

    // Verifica che il contributo esista e sia un bonifico pending
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId },
      include: {
        payment: true,
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
    });

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contributo non trovato' },
        { status: 404 }
      );
    }

    if (contribution.metodoPagamento !== 'bonifico') {
      return NextResponse.json(
        { error: 'Questo contributo non è un bonifico bancario' },
        { status: 400 }
      );
    }

    if (contribution.stato === 'completed') {
      return NextResponse.json(
        { error: 'Questo contributo è già stato verificato' },
        { status: 400 }
      );
    }

    // Aggiorna il contributo con la contabile
    const updatedContribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: {
        stato: 'pending_verification', // Stato intermedio in attesa di verifica admin
        contabile: contabile,
        payment: {
          update: {
            transactionId: contabile, // Salviamo la contabile come transaction ID
            metadata: JSON.stringify({
              contabile: contabile,
              dataInserimentoContabile: new Date().toISOString(),
              note: 'Contabile inserita dall\'utente - in attesa di verifica admin'
            })
          }
        }
      }
    });

    // TODO: Qui potresti inviare una notifica email all'admin per verificare il bonifico
    // await sendAdminNotification(contribution, contabile);

    return NextResponse.json({
      success: true,
      message: 'Contabile registrata con successo. Il contributo sarà verificato dall\'autoscuola entro 1-2 giorni lavorativi.',
      contribution: updatedContribution
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Errore nella conferma bonifico:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}