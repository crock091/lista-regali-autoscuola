import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // TODO: Implementare autenticazione reale
    // Per ora prendiamo il primo studente nel database
    
    const student = await prisma.student.findFirst({
      include: {
        giftLists: {
          include: {
            giftItems: {
              include: {
                contributions: {
                  where: { stato: 'completed' },
                  orderBy: { dataContributo: 'desc' }
                },
              },
            },
          },
          where: { attiva: true },
          orderBy: { createdAt: 'desc' },
          take: 1 // Prendi solo la lista più recente
        },
      },
    })

    if (!student || student.giftLists.length === 0) {
      // Se non c'è uno studente o lista, crea dati demo
      return NextResponse.json({
        student: {
          id: 'demo',
          nome: 'Mario',
          cognome: 'Rossi',
          email: 'mario@demo.it',
          categoriaPatente: 'B'
        },
        giftList: {
          id: 'demo-list',
          titolo: 'La mia Patente B 🚗',
          descrizione: 'Aiutami a realizzare il sogno di guidare!',
          shareToken: 'demo-token',
          iscrizione: {
            importoTarget: 500,
            importoRaccolto: 0,
            percentuale: 0
          },
          guide: {
            importoTarget: 300, // 6 ore × 50€
            importoRaccolto: 0,
            percentuale: 0,
            oreTarget: 6,
            oreRaggiunte: 0
          },
          totale: {
            importoTarget: 800,
            importoRaccolto: 0,
            percentuale: 0
          }
        },
        contributi: {
          numero: 0,
          recenti: []
        }
      })
    }

    const giftList = student.giftLists[0]
    
    // Trova i due elementi principali
    const iscrizioneItem = giftList.giftItems.find((item: any) => item.tipo === 'iscrizione')
    const guideItem = giftList.giftItems.find((item: any) => item.tipo === 'guida')
    
    if (!iscrizioneItem || !guideItem) {
      return NextResponse.json(
        { error: 'Lista regali incompleta' },
        { status: 400 }
      )
    }

    // Calcola percentuali
    const iscrizionePerc = iscrizioneItem.importoTarget > 0 ? 
      (iscrizioneItem.importoRaccolto / iscrizioneItem.importoTarget) * 100 : 0
    
    const guidePerc = guideItem.importoTarget > 0 ? 
      (guideItem.importoRaccolto / guideItem.importoTarget) * 100 : 0
    
    const totaleTarget = iscrizioneItem.importoTarget + guideItem.importoTarget
    const totaleRaccolto = iscrizioneItem.importoRaccolto + guideItem.importoRaccolto
    const totalePerc = totaleTarget > 0 ? (totaleRaccolto / totaleTarget) * 100 : 0
    
    // Calcola ore raggiunte (ogni 50€ = 1 ora)
    const oreRaggiunte = guideItem.importoRaccolto / 50
    const oreTarget = guideItem.importoTarget / 50

    // Raccogli tutti i contributi
    const allContributions: any[] = []
    giftList.giftItems.forEach((item: any) => {
      item.contributions.forEach((contrib: any) => {
        allContributions.push(contrib)
      })
    })

    // Ordina per data più recente
    allContributions.sort((a, b) => new Date(b.dataContributo).getTime() - new Date(a.dataContributo).getTime())

    return NextResponse.json({
      student: {
        id: student.id,
        nome: student.nome,
        cognome: student.cognome,
        email: student.email,
        categoriaPatente: student.categoriaPatente
      },
      giftList: {
        id: giftList.id,
        titolo: giftList.titolo,
        descrizione: giftList.descrizione || '',
        shareToken: giftList.shareToken,
        iscrizione: {
          importoTarget: iscrizioneItem.importoTarget,
          importoRaccolto: iscrizioneItem.importoRaccolto,
          percentuale: iscrizionePerc
        },
        guide: {
          importoTarget: guideItem.importoTarget,
          importoRaccolto: guideItem.importoRaccolto,
          percentuale: guidePerc,
          oreTarget: oreTarget,
          oreRaggiunte: oreRaggiunte
        },
        totale: {
          importoTarget: totaleTarget,
          importoRaccolto: totaleRaccolto,
          percentuale: totalePerc
        }
      },
      contributi: {
        numero: allContributions.length,
        recenti: allContributions.slice(0, 5).map((contrib: any) => ({
          nome: contrib.nome,
          importo: contrib.importo,
          data: contrib.dataContributo,
          messaggio: contrib.messaggio
        }))
      }
    })

  } catch (error) {
    console.error('Student dashboard error:', error)
    return NextResponse.json(
      { error: 'Errore durante il recupero dei dati' },
      { status: 500 }
    )
  }
}