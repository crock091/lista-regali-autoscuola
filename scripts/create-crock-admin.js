const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createCrockAdmin() {
  console.log('🔐 Creazione admin Crock.91...')
  
  const adminData = {
    email: 'crock.91@autoscuola.it',
    password: 'Crock.91', 
    nome: 'Crock',
    ruolo: 'admin'
  }

  try {
    // Cancella tutti gli admin esistenti
    await prisma.admin.deleteMany({})
    console.log('🗑️  Admin precedenti rimossi')

    // Hash della password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds)

    // Crea il nuovo admin
    const admin = await prisma.admin.create({
      data: {
        email: adminData.email.toLowerCase(),
        password: hashedPassword,
        nome: adminData.nome,
        ruolo: adminData.ruolo,
        attivo: true
      }
    })

    console.log('✅ Admin Crock creato con successo!')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Password:', adminData.password)
    console.log('')
    console.log('🌐 Accedi con queste credenziali!')

  } catch (error) {
    console.error('❌ Errore:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createCrockAdmin()