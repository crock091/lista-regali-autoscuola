const bcrypt = require('bcryptjs')

// Cambia questa password
const newPassword = 'MiaPasswordSicura2024!'

// Hash della password
const saltRounds = 12
const hashedPassword = bcrypt.hashSync(newPassword, saltRounds)

console.log('🔑 Password in chiaro:', newPassword)
console.log('🔐 Password hashata:', hashedPassword)
console.log('')
console.log('📝 Query SQL per Neon:')
console.log(`UPDATE "Admin" SET password = '${hashedPassword}' WHERE email = 'admin@autoscuola.it';`)
console.log('')
console.log('👆 Copia questa query e eseguila nella console Neon!')