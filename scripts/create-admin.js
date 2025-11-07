const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  console.log('🔐 Creazione account admin...')
  
  // Dati dell'admin (modifica questi valori!)
  const adminData = {
    email: 'admin@autoscuola.it',
    password: 'admin123', // CAMBIA QUESTA PASSWORD!
    nome: 'Amministratore',
    ruolo: 'admin'
  }

  try {
    // Controlla se esiste già un admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminData.email }
    })

    if (existingAdmin) {
      console.log('⚠️  Admin già esistente con email:', adminData.email)
      return
    }

    // Hash della password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds)

    // Crea l'admin nel database
    const admin = await prisma.admin.create({
      data: {
        email: adminData.email.toLowerCase(),
        password: hashedPassword,
        nome: adminData.nome,
        ruolo: adminData.ruolo,
        attivo: true
      }
    })

    console.log('✅ Admin creato con successo!')
    console.log('📧 Email:', admin.email)
    console.log('👤 Nome:', admin.nome)
    console.log('🔑 Password:', adminData.password, '(CAMBIALA SUBITO!)')
    console.log('')
    console.log('🌐 Accedi a: http://localhost:3001/admin/login')
    console.log('')
    console.log('⚠️  IMPORTANTE: Cambia la password dopo il primo login!')

  } catch (error) {
    console.error('❌ Errore durante la creazione dell\'admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Esegui lo script
createAdmin()