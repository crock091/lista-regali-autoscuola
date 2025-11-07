import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔐 Login attempt - Email:', email, 'Password:', password)

    // Validazione input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono richiesti' },
        { status: 400 }
      )
    }

    // Trova l'admin nel database
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    })

    console.log('👤 Admin trovato:', admin ? admin.email : 'NESSUNO')

    if (!admin) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      )
    }

    // Verifica se l'admin è attivo
    if (!admin.attivo) {
      return NextResponse.json(
        { error: 'Account admin disabilitato' },
        { status: 401 }
      )
    }

    // Verifica la password
    const passwordMatch = await bcrypt.compare(password, admin.password)
    
    console.log('🔑 Password match:', passwordMatch)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      )
    }

    // Crea il token JWT
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        email: admin.email, 
        ruolo: admin.ruolo 
      },
      JWT_SECRET,
      { expiresIn: '8h' } // Token valido per 8 ore
    )

    // Rimuovi la password dalla risposta
    const { password: _, ...adminData } = admin

    return NextResponse.json({
      message: 'Login admin effettuato con successo',
      token,
      admin: adminData
    })

  } catch (error) {
    console.error('Errore login admin:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}