import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Ottieni tutti gli studenti con le loro liste regali e contributi
    const students = await prisma.student.findMany({
      include: {
        giftLists: {
          include: {
            giftItems: {
              include: {
                contributions: {
                  where: { stato: 'completed' },
                  orderBy: { dataContributo: 'desc' }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calcola statistiche
    const totalStudents = students.length
    const totalLists = students.reduce((sum: number, student: any) => sum + student.giftLists.length, 0)
    
    const allContributions = students.flatMap((student: any) => 
      student.giftLists.flatMap((list: any) => 
        list.giftItems.flatMap((item: any) => item.contributions)
      )
    )

    const totalContributions = allContributions.length
    const totalAmount = allContributions.reduce((sum: number, contribution: any) => sum + contribution.importo, 0)
    const completedContributions = allContributions.filter((c: any) => c.stato === 'completed').length

    // Contributi pending e pending_verification
    const pendingContributions = await prisma.contribution.findMany({
      where: { 
        stato: { 
          in: ['pending', 'pending_verification'] // Solo contributi da verificare, non rejected
        } 
      },
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
      },
      orderBy: { dataContributo: 'desc' }
    })
    const pendingAmount = pendingContributions.reduce((sum: number, c: any) => sum + c.importo, 0)

    // Query separata per contributi rifiutati
    const rejectedContributions = await prisma.contribution.findMany({
      where: { 
        stato: 'rejected'
      },
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
      },
      orderBy: { dataContributo: 'desc' },
      take: 10 // Ultimi 10 rifiutati
    })

    const stats = {
      totalStudents,
      totalLists,
      totalContributions,
      totalAmount,
      pendingAmount,
      completedContributions
    }

    return NextResponse.json({
      students,
      stats,
      recentActivity: allContributions.slice(0, 10), // Ultimi 10 contributi
      pendingContributions: pendingContributions.slice(0, 20), // Contributi in attesa di verifica
      rejectedContributions: rejectedContributions // Contributi rifiutati (separati)
    })

  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dati admin' },
      { status: 500 }
    )
  }
}