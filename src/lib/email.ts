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
  itemDescription: string,
  message?: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: studentEmail,
    subject: '🎁 Hai ricevuto un nuovo contributo!',
    html: `
      <h2>Ciao ${studentName}!</h2>
      <p>Hai ricevuto un nuovo contributo per la tua lista regali!</p>
      <p><strong>${contributorName}</strong> ha contribuito <strong>€${amount.toFixed(2)}</strong> per: <em>${itemDescription}</em></p>
      ${message ? `<p class="text-gray-600 mt-2 italic">"${message}"</p>` : ''}
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

export async function sendStudentPendingVerificationNotification(
  studentEmail: string,
  studentName: string,
  contributorName: string,
  amount: number,
  itemDescription: string,
  metodoPagamento: string,
  message?: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: studentEmail,
    subject: '📝 Nuovo Pagamento in Verifica - Lista Regali',
    html: `
      <h2>Ciao ${studentName}!</h2>
      <p>📩 <strong>${contributorName}</strong> ha inviato un pagamento da verificare!</p>
      
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Dettagli Contributo da Verificare:</strong></p>
        <ul style="margin: 10px 0;">
          <li><strong>Da:</strong> ${contributorName}</li>
          <li><strong>Importo:</strong> €${amount.toFixed(2)}</li>
          <li><strong>Per:</strong> ${itemDescription}</li>
          <li><strong>Metodo:</strong> ${metodoPagamento === 'satispay' ? 'Satispay' : 'Bonifico Bancario'}</li>
        </ul>
        ${message ? `<p style="margin: 10px 0; font-style: italic;">"${message}"</p>` : ''}
      </div>

      <p>⏳ Il pagamento è in attesa di verifica da parte dell'autoscuola.</p>
      <p>Riceverai un'altra email quando il pagamento sarà approvato e l'importo verrà aggiunto al tuo totale!</p>
      
      <hr>
      <p style="color: #666; font-size: 12px;">
        ${process.env.AUTOSCUOLA_NAME}<br>
        📞 ${process.env.AUTOSCUOLA_PHONE}<br>
        📧 ${process.env.AUTOSCUOLA_EMAIL}
      </p>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Email verifica pending inviata allo studente ${studentEmail}`)
  } catch (error) {
    console.error('❌ Errore invio email verifica pending:', error)
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

export async function sendPaymentApprovedNotification(
  studentEmail: string,
  studentName: string,
  contributorName: string,
  amount: number,
  itemDescription: string,
  message?: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: studentEmail,
    subject: '✅ Pagamento Approvato - Lista Regali Autoscuola',
    html: `
      <h2>Ciao ${studentName}!</h2>
      <p>🎉 <strong>Ottima notizia!</strong> Il pagamento di <strong>${contributorName}</strong> è stato verificato e approvato!</p>
      
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Dettagli Contributo Approvato:</strong></p>
        <ul style="margin: 10px 0;">
          <li><strong>Da:</strong> ${contributorName}</li>
          <li><strong>Importo:</strong> €${amount.toFixed(2)}</li>
          <li><strong>Per:</strong> ${itemDescription}</li>
        </ul>
        ${message ? `<p style="margin: 10px 0; font-style: italic; color: #666;">"${message}"</p>` : ''}
      </div>

      <p>L'importo è stato aggiunto al totale raccolto per la tua patente.</p>
      <p>Accedi alla tua dashboard per vedere il progresso aggiornato!</p>
      
      <hr>
      <p style="color: #666; font-size: 12px;">
        ${process.env.AUTOSCUOLA_NAME}<br>
        📞 ${process.env.AUTOSCUOLA_PHONE}<br>
        📧 ${process.env.AUTOSCUOLA_EMAIL}
      </p>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Email di approvazione inviata a ${studentEmail}`)
  } catch (error) {
    console.error('❌ Errore invio email approvazione:', error)
    throw error
  }
}

export async function sendContributorPendingNotification(
  contributorEmail: string,
  contributorName: string,
  amount: number,
  itemDescription: string,
  studentName: string,
  metodoPagamento: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: contributorEmail,
    subject: '📝 Contributo Ricevuto - In Attesa di Verifica',
    html: `
      <h2>Grazie ${contributorName}!</h2>
      <p>🙏 Il tuo contributo è stato registrato con successo!</p>
      
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Dettagli Contributo:</strong></p>
        <ul style="margin: 10px 0;">
          <li><strong>Beneficiario:</strong> ${studentName}</li>
          <li><strong>Importo:</strong> €${amount.toFixed(2)}</li>
          <li><strong>Per:</strong> ${itemDescription}</li>
          <li><strong>Metodo:</strong> ${metodoPagamento === 'satispay' ? 'Satispay' : 'Bonifico Bancario'}</li>
        </ul>
      </div>

      <p>⏳ <strong>Il tuo contributo è in attesa di verifica</strong> da parte dell'autoscuola.</p>
      <p>Riceverai un'altra email quando il pagamento sarà approvato e l'importo verrà accreditato!</p>
      
      <hr>
      <p style="color: #666; font-size: 12px;">
        ${process.env.AUTOSCUOLA_NAME}<br>
        📞 ${process.env.AUTOSCUOLA_PHONE}<br>
        📧 ${process.env.AUTOSCUOLA_EMAIL}
      </p>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Email pending inviata a ${contributorEmail}`)
  } catch (error) {
    console.error('❌ Errore invio email pending:', error)
    // Non blocchiamo per errori email
  }
}

export async function sendContributorApprovedNotification(
  contributorEmail: string,
  contributorName: string,
  amount: number,
  itemDescription: string,
  studentName: string,
  message?: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: contributorEmail,
    subject: '✅ Pagamento Verificato e Approvato!',
    html: `
      <h2>Ciao ${contributorName}!</h2>
      <p>🎉 <strong>Il tuo contributo è stato verificato e approvato!</strong></p>
      
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Ricevuta Contributo Approvato:</strong></p>
        <ul style="margin: 10px 0;">
          <li><strong>Beneficiario:</strong> ${studentName}</li>
          <li><strong>Importo:</strong> €${amount.toFixed(2)}</li>
          <li><strong>Per:</strong> ${itemDescription}</li>
          <li><strong>Stato:</strong> ✅ Approvato e Accreditato</li>
        </ul>
        ${message ? `<p style="margin: 10px 0; font-style: italic; color: #666;">"${message}"</p>` : ''}
      </div>

      <p>💚 Grazie per il tuo prezioso contributo! L'importo è stato accreditato per il percorso di ${studentName}.</p>
      <p>Il tuo gesto aiuterà ${studentName} a realizzare il sogno della patente!</p>
      
      <hr>
      <p style="color: #666; font-size: 12px;">
        ${process.env.AUTOSCUOLA_NAME}<br>
        📞 ${process.env.AUTOSCUOLA_PHONE}<br>
        📧 ${process.env.AUTOSCUOLA_EMAIL}
      </p>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Email approvazione inviata al donatore ${contributorEmail}`)
  } catch (error) {
    console.error('❌ Errore invio email approvazione donatore:', error)
    // Non blocchiamo per errori email
  }
}
