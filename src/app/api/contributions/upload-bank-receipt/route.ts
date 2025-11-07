import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { prisma } from '@/lib/prisma'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

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
      where: { id: contributionId }
    })

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contributo non trovato' },
        { status: 404 }
      )
    }

    // Crea directory se non esiste
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'contabili')
    try {
      await fs.access(uploadsDir)
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true })
    }

    // Genera nome file unico
    const fileExtension = '.pdf'
    const uniqueFilename = `contabile-${uuidv4()}${fileExtension}`
    const filePath = path.join(uploadsDir, uniqueFilename)

    // Salva il file
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, fileBuffer)

    // Aggiorna il contributo nel database
    await prisma.contribution.update({
      where: { id: contributionId },
      data: {
        ricevutaPath: `/uploads/contabili/${uniqueFilename}`,
        stato: 'pending_verification'
      }
    })

    return NextResponse.json({
      message: 'Ricevuta PDF registrata con successo',
      filename: uniqueFilename
    })
  } catch (error) {
    console.error('Errore upload contabile:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}