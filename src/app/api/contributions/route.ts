import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContributionNotification, sendContributionReceipt } from '@/lib/email'
import { z } from 'zod'

const contributeSchema = z.object({
  giftItemId: z.string(),
  nome: z.string().min(2),
  email: z.string().email().optional(),
  importo: z.number().positive(),
  messaggio: z.string().optional(),
  metodoPagamento: z.enum(['satispay', 'bonifico']),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { giftItemId, nome, email, importo, messaggio, metodoPagamento } = 
      contributeSchema.parse(body)

    // Get gift item with related data
    const giftItem = await prisma.giftItem.findUnique({
      where: { id: giftItemId },
      include: {
        giftList: {
          include: {
            student: true,
          },
        },
      },
    })

    if (!giftItem) {
      return NextResponse.json(
        { error: 'Gift item non trovato' },
        { status: 404 }
      )
    }

    // Create contribution and payment
    const contribution = await prisma.contribution.create({
      data: {
        giftItemId,
        nome,
        email: email || null,
        importo,
        messaggio: messaggio || null,
        metodoPagamento,
        stato: 'pending', // Sempre pending fino al pagamento effettivo
        payment: {
          create: {
            stato: 'pending',
          },
        },
      },
      include: {
        payment: true,
      },
    })

    // NON aggiorniamo l'importo raccolto fino al pagamento confermato
    // L'importo verrà aggiornato solo quando il pagamento sarà verificato

    // Return appropriate response based on payment method
    if (metodoPagamento === 'satispay') {
      // Usa il link del negozio Satispay specifico
      const satispayShopUrl = process.env.SATISPAY_SHOP_URL || 'https://www.satispay.com/app/pay/shops/f47d7b67-eb8a-11e5-95cc-06cb0bb44caf';
      
      // Costruisci il link con i parametri (se supportati) o usa il link diretto
      const satispayLink = `${satispayShopUrl}?amount=${importo.toFixed(2)}&reference=REGALO-${contribution.id}`;
      
      return NextResponse.json({
        success: true,
        contribution,
        paymentInfo: {
          type: 'satispay',
          status: 'pending',
          paymentLink: satispayLink,
          shopUrl: satispayShopUrl, // Link diretto senza parametri come fallback
          amount: importo,
          reference: `REGALO-${contribution.id}`,
          description: `Contributo per ${giftItem.descrizione}`,
          studentName: `${giftItem.giftList.student.nome} ${giftItem.giftList.student.cognome}`,
          message: 'Paga direttamente al negozio dell\'autoscuola!',
          instructions: 'Il link ti porterà direttamente al profilo Satispay dell\'autoscuola.',
        },
      })
    } else {
      // Bonifico bancario - mostra coordinate
      return NextResponse.json({
        success: true,
        contribution,
        paymentInfo: {
          type: 'bonifico',
          status: 'pending',
          bankName: process.env.BANK_NAME || 'Banca Autoscuola',
          iban: process.env.IBAN || 'IT60 X054 2811 1010 0000 0123 456',
          recipient: process.env.BANK_RECIPIENT || 'Autoscuola Lista Regali',
          amount: importo,
          reference: `REGALO-${contribution.id}`,
          message: 'Contributo registrato. Completa il pagamento con bonifico bancario usando i dati qui sotto.',
          instructions: 'Una volta effettuato il bonifico, il contributo verrà verificato entro 1-2 giorni lavorativi.',
        },
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Contribute error:', error)
    return NextResponse.json(
      { error: 'Errore durante la registrazione del contributo' },
      { status: 500 }
    )
  }
}
