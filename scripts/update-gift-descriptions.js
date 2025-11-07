const { PrismaClient } = require('@prisma/client');

async function updateGiftItemDescriptions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Aggiornamento descrizioni elementi regalo...');
    
    // Aggiorna tutte le descrizioni che contengono "ore di guida pratica"
    const result = await prisma.giftItem.updateMany({
      where: {
        tipo: 'guida',
        descrizione: {
          contains: 'ore di guida pratica'
        }
      },
      data: {
        descrizione: 'ore di guida pratica'
      }
    });
    
    console.log(`✅ Aggiornate ${result.count} descrizioni di elementi guida`);
    
    // Mostra tutti gli elementi aggiornati
    const updatedItems = await prisma.giftItem.findMany({
      where: {
        tipo: 'guida'
      },
      include: {
        giftList: {
          include: {
            student: true
          }
        }
      }
    });
    
    console.log('\n📋 Elementi guida aggiornati:');
    updatedItems.forEach(item => {
      console.log(`- ${item.giftList.student.nome}: "${item.descrizione}" (€${item.importoTarget})`);
    });
    
  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateGiftItemDescriptions();