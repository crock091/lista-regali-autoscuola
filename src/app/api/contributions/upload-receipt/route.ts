import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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

    // Genera nome file unico
    const fileExtension = 'pdf';
    const fileName = `${uuidv4()}-${contributionId}.${fileExtension}`;
    const filePath = join(process.cwd(), 'public', 'uploads', 'ricevute', fileName);

    // Salva il file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Aggiorna il contributo nel database
    const updatedContribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: {
        ricevutaPath: `/uploads/ricevute/${fileName}`,
        stato: 'pending_verification' // Cambia stato per indicare che è in attesa di verifica
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Ricevuta caricata con successo! Il contributo sarà verificato dall\'autoscuola.',
      contribution: updatedContribution,
      fileName: fileName
    });

  } catch (error) {
    console.error('Errore upload ricevuta:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}