import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    // Verifica autenticazione admin
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Token di autorizzazione mancante' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const action = searchParams.get('action') // 'delete-student' | 'delete-rejected-contributions'

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId è richiesto' },
        { status: 400 }
      )
    }

    if (action === 'delete-rejected-contributions') {
      // Elimina solo i contributi rifiutati dello studente
      const deletedCount = await prisma.contribution.deleteMany({
        where: {
          stato: 'rejected',
          giftItem: {
            giftList: {
              studentId: studentId
            }
          }
        }
      })

      return NextResponse.json({
        message: `Eliminati ${deletedCount.count} contributi rifiutati`,
        deletedCount: deletedCount.count
      })
    } else {
      // Elimina studente completo (cascade elimina tutto)
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          giftLists: {
            include: {
              giftItems: {
                include: {
                  contributions: true
                }
              }
            }
          }
        }
      })

      if (!student) {
        return NextResponse.json(
          { error: 'Studente non trovato' },
          { status: 404 }
        )
      }

      // Conta i contributi prima di eliminare
      const totalContributions = student.giftLists.reduce((sum, list) => 
        sum + list.giftItems.reduce((itemSum, item) => itemSum + item.contributions.length, 0), 0
      )

      // Elimina studente (cascade automatico su liste, items, contributi)
      await prisma.student.delete({
        where: { id: studentId }
      })

      return NextResponse.json({
        message: `Studente ${student.nome} ${student.cognome} eliminato con successo`,
        student: {
          nome: student.nome,
          cognome: student.cognome,
          email: student.email
        },
        eliminatedData: {
          giftLists: student.giftLists.length,
          giftItems: student.giftLists.reduce((sum, list) => sum + list.giftItems.length, 0),
          contributions: totalContributions
        }
      })
    }

  } catch (error) {
    console.error('Errore eliminazione:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}