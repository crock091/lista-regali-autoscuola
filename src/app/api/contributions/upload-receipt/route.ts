import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendContributorPendingNotification, sendStudentPendingVerificationNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const contributionId = formData.get('contributionId') as string;
    const file = formData.get('ricevuta') as File;

    if (!contributionId || !file) {
      return NextResponse.json(
        { error: 'ID contributo e file ricevuta sono obbligatori' },
        { status: 400 }
      );
    }

    // Verifica che sia un PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Solo file PDF sono accettati' },
        { status: 400 }
      );
    }

    // Verifica dimensione file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Il file non può superare i 5MB' },
        { status: 400 }
      );
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
    });

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contributo non trovato' },
        { status: 404 }
      );
    }

    if (contribution.metodoPagamento !== 'satispay') {
      return NextResponse.json(
        { error: 'Upload ricevuta disponibile solo per Satispay' },
        { status: 400 }
      );
    }

    // Converti file in Base64 per storage Vercel-compatible
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString('base64');

    // Aggiorna il contributo nel database con Base64
    const updatedContribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: {
        ricevutaBase64: base64Content,
        ricevutaName: file.name,
        ricevutaPath: null, // Clear old path field
        stato: 'pending_verification' // Cambia stato per indicare che è in attesa di verifica
      }
    });

    // Invia email di conferma al donatore se ha fornito l'email
    const student = contribution.giftItem.giftList.student;
    
    if (contribution.email) {
      try {
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

    // Invia email allo studente per notificare il nuovo pagamento da verificare
    try {
      await sendStudentPendingVerificationNotification(
        student.email,
        `${student.nome} ${student.cognome}`,
        contribution.nome,
        contribution.importo,
        contribution.giftItem.descrizione,
        contribution.metodoPagamento,
        contribution.messaggio || undefined
      );
    } catch (emailError) {
      console.error('❌ Errore invio email pending allo studente:', emailError);
      // Non blocchiamo l'upload per errori email
    }

    return NextResponse.json({
      success: true,
      message: 'Ricevuta caricata con successo! Il contributo sarà verificato dall\'autoscuola.',
      contribution: updatedContribution,
      fileName: file.name
    });

  } catch (error) {
    console.error('Errore upload ricevuta:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}