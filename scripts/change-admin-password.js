const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function changeAdminPassword() {
  console.log('🔐 Cambio password admin...')
  
  // MODIFICA QUESTA PASSWORD!
  const newPassword = 'NuovaPasswordSicura123!'
  const adminEmail = 'admin@autoscuola.it'

  try {
    // Trova l'admin
    const admin = await prisma.admin.findUnique({
      where: { email: adminEmail }
    })

    if (!admin) {
      console.log('❌ Admin non trovato con email:', adminEmail)
      return
    }

    // Hash della nuova password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Aggiorna la password nel database
    await prisma.admin.update({
      where: { email: adminEmail },
      data: { password: hashedPassword }
    })

    console.log('✅ Password cambiata con successo!')
    console.log('📧 Email admin:', adminEmail)
    console.log('🔑 Nuova password:', newPassword)
    console.log('')
    console.log('🌐 Ora puoi loggarti con le nuove credenziali!')

  } catch (error) {
    console.error('❌ Errore durante il cambio password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Esegui lo script
changeAdminPassword()