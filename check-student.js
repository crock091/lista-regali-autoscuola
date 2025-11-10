const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkRecentStudent() {
  try {
    // Trova lo studente più recente con email test2@example.com
    const student = await prisma.student.findUnique({
      where: { email: 'test2@example.com' },
      include: {
        giftLists: {
          include: {
            giftItems: true
          }
        }
      }
    })
    
    if (!student) {
      console.log('❌ Student not found')
      return
    }
    
    console.log('👤 Student found:', {
      id: student.id,
      email: student.email,
      nome: student.nome,
      cognome: student.cognome,
      categoriaPatente: student.categoriaPatente
    })
    
    console.log('\n🎁 Gift Lists:')
    if (student.giftLists.length === 0) {
      console.log('❌ NO GIFT LISTS FOUND! This is the problem.')
    } else {
      student.giftLists.forEach((list, i) => {
        console.log(`   ${i+1}. ${list.titolo} (${list.shareToken})`)
        console.log(`      Active: ${list.attiva}`)
        console.log(`      Items: ${list.giftItems.length}`)
        list.giftItems.forEach((item, j) => {
          console.log(`         ${j+1}. ${item.descrizione} - €${item.importoTarget}`)
        })
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRecentStudent()