const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getGiftLinks() {
  try {
    console.log('=== LISTE REGALI ===')
    
    const lists = await prisma.giftList.findMany({
      include: {
        student: true,
        giftItems: {
          include: {
            contributions: true
          }
        }
      }
    })
    
    lists.forEach(list => {
      console.log('Token:', list.shareToken)
      console.log('Studente:', list.student.nome, list.student.cognome)
      console.log('Link: http://localhost:3000/regali/' + list.shareToken)
      console.log('Elementi lista:', list.giftItems.length)
      console.log('Contributi totali:', list.giftItems.reduce((sum, item) => sum + item.contributions.length, 0))
      console.log('---')
    })
    
    // Mostra anche i contributi
    console.log('\n=== CONTRIBUTI ===')
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
      }
    })
    
    contributions.forEach(contrib => {
      console.log('ID:', contrib.id)
      console.log('Nome:', contrib.nome)
      console.log('Importo:', contrib.importo)
      console.log('Stato:', contrib.stato)
      console.log('Metodo:', contrib.metodoPagamento)
      console.log('Ricevuta:', contrib.ricevutaPath || 'Nessuna')
      console.log('Studente:', contrib.giftItem.giftList.student.nome)
      console.log('---')
    })
    
  } catch (error) {
    console.error('Errore:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getGiftLinks()