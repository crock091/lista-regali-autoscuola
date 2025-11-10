const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkStudent() {
  try {
    const studentId = 'cmht6wael00003fhedzm2zbcf'
    console.log(`🔍 Checking student with ID: ${studentId}`)
    
    const student = await prisma.student.findUnique({
      where: { id: studentId },
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
    
    if (!student) {
      console.log('❌ Student NOT FOUND in database')
      console.log('   This explains the 404 error!')
    } else {
      console.log('✅ Student found:', {
        id: student.id,
        email: student.email,
        nome: student.nome,
        cognome: student.cognome,
        createdAt: student.createdAt
      })
      console.log(`   Gift Lists: ${student.giftLists.length}`)
      
      let totalContributions = 0
      student.giftLists.forEach(list => {
        list.giftItems.forEach(item => {
          totalContributions += item.contributions.length
        })
      })
      console.log(`   Total Contributions: ${totalContributions}`)
    }
    
    // List all students for reference
    console.log('\n📋 All students in database:')
    const allStudents = await prisma.student.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        cognome: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    allStudents.forEach((s, i) => {
      const isTarget = s.id === studentId ? ' ⭐ TARGET' : ''
      console.log(`   ${i+1}. ${s.nome} ${s.cognome} (${s.email})${isTarget}`)
      console.log(`      ID: ${s.id}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkStudent()