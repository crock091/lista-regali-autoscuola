import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Estrai studentId dai parametri URL
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'ID studente mancante' },
        { status: 401 }
      )
    }
    
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        giftLists: {
          include: {
            giftItems: {
              include: {
                contributions: {
                  // Mostra tutti i contributi (pending, pending_verification, completed, rejected)
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

    if (!student) {
      return NextResponse.json(
        { error: 'Studente non trovato' },
        { status: 404 }
      )
    }

    if (student.giftLists.length === 0) {
      // Se lo studente non ha liste, restituisci i suoi dati con lista vuota
      return NextResponse.json({
        student: {
          id: student.id,
          nome: student.nome,
          cognome: student.cognome,
          email: student.email,
          categoriaPatente: student.categoriaPatente
        },
        giftList: null,
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
          messaggio: contrib.messaggio,
          stato: contrib.stato, // Aggiungiamo lo stato
          note: contrib.note // E le note admin (motivo rifiuto)
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