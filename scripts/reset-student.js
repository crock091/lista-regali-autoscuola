const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function resetStudent() {
  try {
    console.log('🔍 Ricerca studenti...')
    
    const students = await prisma.student.findMany({
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
    
    if (students.length === 0) {
      console.log('❌ Nessuno studente trovato')
      return
    }
    
    console.log(`📋 Trovati ${students.length} studenti:`)
    students.forEach((student, index) => {
      const totalContributions = student.giftLists.reduce((sum, list) => 
        sum + list.giftItems.reduce((itemSum, item) => itemSum + item.contributions.length, 0), 0
      )
      console.log(`${index + 1}. ${student.nome} ${student.cognome} (${student.email}) - ${totalContributions} contributi`)
    })
    
    // Per ora eliminiamo solo il primo studente
    const studentToDelete = students[0]
    
    console.log(`\n🗑️ Eliminazione studente: ${studentToDelete.nome} ${studentToDelete.cognome}`)
    
    // Prima raccogliamo tutti i file PDF da eliminare
    const pdfFiles = []
    studentToDelete.giftLists.forEach(list => {
      list.giftItems.forEach(item => {
        item.contributions.forEach(contribution => {
          if (contribution.ricevutaPath) {
            pdfFiles.push(contribution.ricevutaPath)
          }
        })
      })
    })
    
    console.log(`📁 File PDF da eliminare: ${pdfFiles.length}`)
    
    // Elimina lo studente (cascade eliminerà tutto)
    await prisma.student.delete({
      where: { id: studentToDelete.id }
    })
    
    // Elimina i file PDF fisici
    for (const pdfPath of pdfFiles) {
      try {
        const fullPath = path.join(process.cwd(), 'public', pdfPath)
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath)
          console.log(`🗑️ Eliminato: ${pdfPath}`)
        }
      } catch (error) {
        console.log(`⚠️ Errore eliminando ${pdfPath}:`, error.message)
      }
    }
    
    console.log('\n✅ Reset completato!')
    console.log('📊 Verifica stato finale...')
    
    // Verifica che tutto sia stato eliminato
    const remainingStudents = await prisma.student.count()
    const remainingLists = await prisma.giftList.count()
    const remainingItems = await prisma.giftItem.count()
    const remainingContributions = await prisma.contribution.count()
    const remainingPayments = await prisma.payment.count()
    
    console.log(`👥 Studenti rimanenti: ${remainingStudents}`)
    console.log(`📋 Liste rimanenti: ${remainingLists}`)
    console.log(`🎁 Item rimanenti: ${remainingItems}`)
    console.log(`💰 Contributi rimanenti: ${remainingContributions}`)
    console.log(`💳 Pagamenti rimanenti: ${remainingPayments}`)
    
  } catch (error) {
    console.error('❌ Errore:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetStudent()