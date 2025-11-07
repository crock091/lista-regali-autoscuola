import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendContributionNotification(
  studentEmail: string,
  studentName: string,
  contributorName: string,
  amount: number,
  itemDescription: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: studentEmail,
    subject: '🎁 Hai ricevuto un nuovo contributo!',
    html: `
      <h2>Ciao ${studentName}!</h2>
      <p>Hai ricevuto un nuovo contributo per la tua lista regali!</p>
      <p><strong>${contributorName}</strong> ha contribuito <strong>€${amount.toFixed(2)}</strong> per: <em>${itemDescription}</em></p>
      <p>Accedi alla tua dashboard per vedere i dettagli.</p>
      <hr>
      <p><small>Lista Regali Autoscuola - ${process.env.AUTOSCUOLA_NAME}</small></p>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

export async function sendContributionReceipt(
  contributorEmail: string,
  contributorName: string,
  amount: number,
  itemDescription: string,
  studentName: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: contributorEmail,
    subject: 'Conferma Contributo - Lista Regali Autoscuola',
    html: `
      <h2>Grazie per il tuo contributo!</h2>
      <p>Ciao ${contributorName},</p>
      <p>Il tuo contributo di <strong>€${amount.toFixed(2)}</strong> per <strong>${studentName}</strong> è stato registrato con successo!</p>
      <p><strong>Dettagli:</strong></p>
      <ul>
        <li>Importo: €${amount.toFixed(2)}</li>
        <li>Per: ${itemDescription}</li>
        <li>Beneficiario: ${studentName}</li>
      </ul>
      <p>Il pagamento verrà applicato direttamente al costo della patente di ${studentName}.</p>
      <hr>
      <p><small>${process.env.AUTOSCUOLA_NAME}<br>${process.env.AUTOSCUOLA_PHONE}<br>${process.env.AUTOSCUOLA_EMAIL}</small></p>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Error sending receipt email:', error)
  }
}
