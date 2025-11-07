import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const format = request.nextUrl.searchParams.get('format') || 'json'

    if (format === 'csv') {
      // Esporta in CSV
      const contributions = await prisma.contribution.findMany({
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

      const csvHeaders = [
        'Data',
        'Allievo',
        'Email Allievo',
        'Lista',
        'Voce',
        'Contributore',
        'Email Contributore',
        'Importo',
        'Metodo',
        'Stato',
        'Messaggio'
      ]

      const csvRows = contributions.map((c: any) => [
        new Date(c.dataContributo).toLocaleDateString('it-IT'),
        `${c.giftItem.giftList.student.nome} ${c.giftItem.giftList.student.cognome}`,
        c.giftItem.giftList.student.email,
        c.giftItem.giftList.titolo,
        c.giftItem.descrizione,
        c.nome,
        c.email || '',
        c.importo.toFixed(2),
        c.metodoPagamento,
        c.stato,
        c.messaggio || ''
      ])

      const csv = [csvHeaders, ...csvRows]
        .map(row => row.map((field: any) => `"${field}"`).join(','))
        .join('\n')

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="contributi_autoscuola.csv"'
        }
      })
    }

    // Formato JSON (default)
    const contributions = await prisma.contribution.findMany({
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

    return NextResponse.json({ contributions })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Errore durante l\'esportazione' },
      { status: 500 }
    )
  }
}