import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token e password richiesti' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La password deve essere di almeno 6 caratteri' },
        { status: 400 }
      )
    }

    // Cerca lo studente con il token valido
    const student = await prisma.student.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Token non scaduto
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Link non valido o scaduto. Richiedi un nuovo reset password.' },
        { status: 400 }
      )
    }

    // Hash della nuova password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Aggiorna la password e rimuovi il token
    await prisma.student.update({
      where: { id: student.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return NextResponse.json(
      { message: 'Password aggiornata con successo' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Errore reset password:', error)
    return NextResponse.json(
      { error: 'Errore durante il reset della password' },
      { status: 500 }
    )
  }
}
