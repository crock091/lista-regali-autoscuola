const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { nanoid } = require('nanoid')

const prisma = new PrismaClient()

async function testRegistration() {
  try {
    console.log('🧪 Testing registration with automatic list creation...')
    
    // Genera dati test
    const testEmail = `test-${Date.now()}@example.com`
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    console.log(`📧 Creating student with email: ${testEmail}`)
    
    // Crea student
    const student = await prisma.student.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        nome: 'Mario',
        cognome: 'Rossi',
        telefono: '+39123456789',
        categoriaPatente: 'B',
      },
    })
    
    console.log(`✅ Student created:`, student.id)
    
    // Costi automatici basati sulla categoria
    const costiCategorie = {
      'AM': { iscrizione: 300, oreMinime: 6 },
      'A1': { iscrizione: 400, oreMinime: 6 },
      'A2': { iscrizione: 500, oreMinime: 6 },
      'A3': { iscrizione: 600, oreMinime: 6 },
      'B': { iscrizione: 500, oreMinime: 6 }
    }
    
    const costi = costiCategorie['B']
    const costoGuide = costi.oreMinime * 50 // 50€ per ora
    
    console.log(`💰 Costs: Iscrizione €${costi.iscrizione}, Guide €${costoGuide}`)
    
    // Crea automaticamente la lista regali per la patente
    const giftList = await prisma.giftList.create({
      data: {
        studentId: student.id,
        titolo: `La mia Patente B 🚗`,
        descrizione: `Aiutami a realizzare il sogno di guidare con la patente B!`,
        shareToken: nanoid(16),
        giftItems: {
          create: [
            {
              tipo: 'iscrizione',
              descrizione: `Iscrizione corso patente B`,
              importoTarget: costi.iscrizione,
              importoRaccolto: 0,
            },
            {
              tipo: 'guida',
              descrizione: `ore di guida pratica`,
              importoTarget: costoGuide,
              importoRaccolto: 0,
            }
          ]
        }
      },
      include: {
        giftItems: true
      }
    })
    
    console.log('🎁 Gift list created:', giftList)
    
    // Verifica che tutto sia stato creato
    const verification = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        giftLists: {
          include: {
            giftItems: true
          }
        }
      }
    })
    
    console.log('🔍 Verification - Student with lists:', verification)
    
    if (verification.giftLists.length > 0) {
      console.log('✅ SUCCESS: Lista creata automaticamente!')
      console.log(`📋 Lista: "${verification.giftLists[0].titolo}"`)
      console.log(`🔗 Share token: ${verification.giftLists[0].shareToken}`)
      console.log(`📊 Gift items: ${verification.giftLists[0].giftItems.length}`)
      verification.giftLists[0].giftItems.forEach((item, i) => {
        console.log(`   ${i+1}. ${item.descrizione} - €${item.importoTarget}`)
      })
    } else {
      console.log('❌ ERROR: Nessuna lista creata!')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRegistration()