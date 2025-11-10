const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test della connessione
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Controlla quanti studenti ci sono
    const studentCount = await prisma.student.count()
    console.log(`👥 Students in database: ${studentCount}`)
    
    // Mostra gli ultimi 3 studenti
    const recentStudents = await prisma.student.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        cognome: true,
        categoriaPatente: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
    
    console.log('\n📋 Recent students:')
    recentStudents.forEach((student, i) => {
      console.log(`   ${i+1}. ${student.nome} ${student.cognome} (${student.email}) - ${student.categoriaPatente}`)
      console.log(`      Created: ${student.createdAt.toISOString()}`)
    })
    
    // Controlla quante liste ci sono
    const listCount = await prisma.giftList.count()
    console.log(`\n🎁 Gift lists in database: ${listCount}`)
    
    // Controlla anche le migrazioni applicate
    console.log('\n🗃️ Database info:')
    console.log(`   Provider: ${process.env.DATABASE_URL ? 'PostgreSQL (via DATABASE_URL)' : 'NOT CONFIGURED'}`)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    
    if (error.code === 'P1001') {
      console.log('\n💡 This usually means:')
      console.log('   - Database server is unreachable')
      console.log('   - Wrong connection string')
      console.log('   - Network/firewall issues')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testDatabaseConnection()