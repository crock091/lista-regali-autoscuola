import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test semplice per verificare la connessione al database
    const count = await prisma.student.count()
    
    return NextResponse.json({ 
      status: 'Database connesso!',
      totalStudents: count,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        error: 'Errore connessione database', 
        message: error.message,
        details: error.toString()
      },
      { status: 500 }
    )
  }
}