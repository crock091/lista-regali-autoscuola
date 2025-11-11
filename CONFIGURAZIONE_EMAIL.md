# Configurazione Email Gmail per Notifiche

## 📧 Setup Gmail per Invio Email

Per permettere all'applicazione di inviare email da `autoscuolaardito@gmail.com`, devi configurare una **App Password** di Gmail.

### 1. Abilita l'autenticazione a 2 fattori su Gmail

1. Vai su [myaccount.google.com/security](https://myaccount.google.com/security)
2. Cerca "Verifica in due passaggi" (2-Step Verification)
3. Attivala se non è già attiva

### 2. Genera una App Password

1. Vai su [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Se chiede, accedi con la password Gmail
3. In "Select app" scegli **Mail**
4. In "Select device" scegli **Other (Custom name)**
5. Scrivi: **Lista Regali Autoscuola**
6. Clicca **Generate**
7. Gmail ti mostrerà una password di 16 caratteri (es: `abcd efgh ijkl mnop`)
8. **COPIA QUESTA PASSWORD** (senza spazi)

### 3. Configura le Variabili d'Ambiente

#### Nel file `.env` locale:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="autoscuolaardito@gmail.com"
SMTP_PASSWORD="abcdefghijklmnop"  # ← La App Password generata (senza spazi)
EMAIL_FROM="autoscuolaardito@gmail.com"
```

#### Su Vercel (Produzione):
1. Vai su [vercel.com](https://vercel.com) → Il tuo progetto
2. **Settings** → **Environment Variables**
3. Aggiungi queste variabili:

| Name | Value |
|------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `autoscuolaardito@gmail.com` |
| `SMTP_PASSWORD` | `abcdefghijklmnop` (la App Password) |
| `EMAIL_FROM` | `autoscuolaardito@gmail.com` |

4. Seleziona tutti gli ambienti (Production, Preview, Development)
5. **Salva** e fai **Redeploy** del progetto

## ✅ Funzionalità Email Implementate

### 1. Email di Approvazione Pagamento
Quando approvi un contributo dalla dashboard admin, viene inviata automaticamente una email allo studente con:
- ✅ Conferma approvazione
- 💰 Dettagli del contributo (importo, donatore)
- 📊 Invito a controllare la dashboard

### 2. Email già disponibili (da testare):
- `sendContributionNotification()` - Notifica nuovo contributo allo studente
- `sendContributionReceipt()` - Ricevuta al donatore
- `sendPaymentApprovedNotification()` - Conferma approvazione (NUOVA)

## 🧪 Test Email

Per testare che le email funzionino:

1. **In locale**: 
   - Configura il file `.env` con la App Password
   - Riavvia il server `npm run dev`
   - Approva un contributo dalla dashboard admin
   - Controlla la casella email dello studente

2. **In produzione**:
   - Configura le variabili su Vercel
   - Redeploy il progetto
   - Approva un contributo
   - Controlla i Runtime Logs su Vercel per vedere:
     - `✅ Email di approvazione inviata a ...`
     - Oppure errori se qualcosa non va

## ⚠️ Limiti Gmail

Gmail ha limiti di invio:
- **500 email/giorno** per account Gmail normali
- **2000 email/giorno** per Google Workspace

Per un'autoscuola questo dovrebbe essere più che sufficiente.

## 🔒 Sicurezza

- ⚠️ **NON committare mai** la App Password su Git
- ✅ Il file `.env` è già nel `.gitignore`
- ✅ Le variabili su Vercel sono criptate e sicure

## 📝 Note

- Le email vengono inviate in modo asincrono
- Se l'invio email fallisce, l'approvazione del contributo viene comunque completata
- Gli errori email vengono loggati ma non bloccano l'operazione
