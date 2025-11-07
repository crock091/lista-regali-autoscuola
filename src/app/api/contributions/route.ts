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
        stato: metodoPagamento === 'bonifico' ? 'pending' : 'pending',
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

    // Update gift item amount (optimistic - in production, wait for payment confirmation)
    if (metodoPagamento === 'bonifico') {
      await prisma.giftItem.update({
        where: { id: giftItemId },
        data: {
          importoRaccolto: {
            increment: importo,
          },
        },
      })

      // Send notifications for bonifico (immediate)
      await sendContributionNotification(
        giftItem.giftList.student.email,
        giftItem.giftList.student.nome,
        nome,
        importo,
        giftItem.descrizione
      )

      if (email) {
        await sendContributionReceipt(
          email,
          nome,
          importo,
          giftItem.descrizione,
          `${giftItem.giftList.student.nome} ${giftItem.giftList.student.cognome}`
        )
      }
    }

    // Return appropriate response based on payment method
    if (metodoPagamento === 'satispay') {
      // In production, create actual Satispay payment
      return NextResponse.json({
        message: 'Contributo registrato',
        contribution,
        paymentInfo: {
          type: 'satispay',
          // redirectUrl: satispayPayment.redirectUrl, // From actual Satispay API
          instructions: 'Verrai reindirizzato a Satispay per completare il pagamento',
        },
      })
    } else {
      return NextResponse.json({
        message: 'Contributo registrato',
        contribution,
        paymentInfo: {
          type: 'bonifico',
          bankName: process.env.BANK_NAME,
          iban: process.env.IBAN,
          recipient: process.env.BANK_RECIPIENT,
          amount: importo,
          reference: `REGALO-${contribution.id}`,
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
