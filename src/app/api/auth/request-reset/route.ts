import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email richiesta' },
        { status: 400 }
      )
    }

    // Cerca lo studente
    const student = await prisma.student.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Per sicurezza, rispondiamo sempre con successo anche se l'email non esiste
    // Questo previene che qualcuno possa scoprire quali email sono registrate
    if (!student) {
      return NextResponse.json(
        { message: 'Se l\'email è registrata, riceverai le istruzioni' },
        { status: 200 }
      )
    }

    // Genera token casuale
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 ora

    // Salva il token nel database
    await prisma.student.update({
      where: { id: student.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Invia email con link di reset
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    
    await sendPasswordResetEmail(
      student.email,
      student.nome,
      resetUrl
    )

    return NextResponse.json(
      { message: 'Email di reset inviata con successo' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Errore richiesta reset password:', error)
    return NextResponse.json(
      { error: 'Errore durante la richiesta di reset' },
      { status: 500 }
    )
  }
}
