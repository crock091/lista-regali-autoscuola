# 🎁 Lista Regali Autoscuola

Applicazione web che permette agli allievi di un'autoscuola di creare liste regali natalizie per ricevere contributi da amici e parenti verso il pagamento di iscrizione, guide ed esami per la patente.

## 🎯 Funzionalità

- **Registrazione Allievi**: Sistema di autenticazione con email e password
- **Creazione Lista Regali**: Gli allievi possono creare liste personalizzate con voci per iscrizione, guide pratiche ed esami
- **Link Condivisione**: Ogni lista genera un link unico da condividere con amici e parenti
- **Pagina Pubblica**: Chi riceve il link può visualizzare la lista e contribuire
- **Pagamenti Diretti**: I contributi vengono pagati direttamente all'autoscuola tramite:
  - **Satispay** (integrazione API)
  - **Bonifico Bancario** (con istruzioni dettagliate)
- **Tracking Contributi**: Monitoraggio in tempo reale dei contributi ricevuti
- **Notifiche Email**: Conferme automatiche per allievi e contributori

## 🛠️ Stack Tecnologico

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM (SQLite in sviluppo, PostgreSQL in produzione)
- **Autenticazione**: Custom auth (migrabile a NextAuth.js)
- **Pagamenti**: Satispay API + Bonifico Bancario
- **Email**: Nodemailer
- **UI Icons**: Lucide React

## 📦 Installazione

### Prerequisiti

- Node.js 18+ installato
- npm o yarn

### Setup Progetto

1. **Clona il repository** (se applicabile) o naviga nella cartella del progetto

2. **Installa le dipendenze**:
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente**:
   ```bash
   cp .env.example .env
   ```

   Modifica `.env` con i tuoi dati:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Autoscuola Info
   AUTOSCUOLA_NAME="La Tua Autoscuola"
   AUTOSCUOLA_EMAIL="info@tuaautoscuola.it"
   AUTOSCUOLA_PHONE="+39 123 456 7890"

   # Bonifico Bancario
   BANK_NAME="Nome Banca"
   IBAN="IT00X0000000000000000000000"
   BANK_RECIPIENT="Autoscuola S.r.l."

   # Satispay (registrati su https://developers.satispay.com/)
   SATISPAY_KEY_ID="your-key-id"
   SATISPAY_PRIVATE_KEY="your-private-key"
   SATISPAY_ACTIVATION_CODE="your-activation-code"

   # Email SMTP
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   EMAIL_FROM="noreply@autoscuola.it"
   ```

4. **Inizializza il database**:
   ```bash
   npm run db:push
   ```

5. **Avvia il server di sviluppo**:
   ```bash
   npm run dev
   ```

6. **Apri il browser** su [http://localhost:3000](http://localhost:3000)

## 🚀 Utilizzo

### Per gli Allievi

1. **Registrati** sulla homepage
2. **Crea la tua lista regali** dalla dashboard
3. **Aggiungi voci** (es. "Contributo iscrizione €300", "Pacchetto 5 guide €200")
4. **Condividi il link** con amici e parenti

### Per Amici/Parenti

1. **Apri il link** ricevuto dall'allievo
2. **Visualizza la lista regali** e scegli a cosa contribuire
3. **Inserisci i tuoi dati** e l'importo desiderato
4. **Scegli metodo di pagamento**:
   - **Satispay**: pagamento immediato tramite app
   - **Bonifico**: ricevi le coordinate bancarie per il bonifico
5. **Ricevi conferma** via email

## 📁 Struttura Progetto

```
lista-regali-autoscuola/
├── prisma/
│   └── schema.prisma          # Schema database Prisma
├── src/
│   ├── app/
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Registrazione e login
│   │   │   ├── gift-lists/    # Gestione liste regali
│   │   │   └── contributions/ # Gestione contributi
│   │   ├── dashboard/         # Dashboard allievi (TODO)
│   │   ├── regali/[token]/    # Pagina pubblica condivisione (TODO)
│   │   ├── globals.css        # Stili globali
│   │   ├── layout.tsx         # Layout principale
│   │   └── page.tsx           # Homepage
│   └── lib/
│       ├── prisma.ts          # Client Prisma
│       ├── utils.ts           # Utility functions
│       ├── email.ts           # Gestione email
│       └── satispay.ts        # Integrazione Satispay (placeholder)
├── .env.example               # Template variabili d'ambiente
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🔐 Sicurezza

- Le password sono hashate con bcrypt
- Ogni lista ha un token univoco non indovinabile
- Validazione input con Zod
- (Produzione) Implementare autenticazione JWT/session
- (Produzione) Rate limiting sulle API
- (Produzione) HTTPS obbligatorio

## 💳 Integrazione Pagamenti

### Satispay

1. Registrati su [Satispay for Developers](https://developers.satispay.com/)
2. Ottieni le credenziali API
3. Aggiorna `.env` con i tuoi dati
4. Implementa i metodi in `src/lib/satispay.ts` (attualmente placeholder)

### Bonifico Bancario

Il sistema fornisce automaticamente le coordinate bancarie ai contributori. Aggiorna le informazioni nel file `.env`.

## 📧 Configurazione Email

### Gmail (esempio)

1. Attiva "Verifica in due passaggi" sul tuo account Google
2. Genera una "Password per le app" dalle impostazioni di sicurezza
3. Usa quella password in `.env` come `SMTP_PASSWORD`

## 🌐 Deploy in Produzione

### Vercel (Consigliato)

1. Cambia database da SQLite a PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Deploy su Vercel:
   ```bash
   vercel
   ```

3. Configura le variabili d'ambiente su Vercel

4. Esegui le migration:
   ```bash
   npx prisma migrate deploy
   ```

## 📝 TODO

- [ ] Completare dashboard allievi
- [ ] Creare pagina pubblica condivisione `/regali/[token]`
- [ ] Implementare autenticazione con sessioni (NextAuth.js)
- [ ] Integrare Satispay API reale
- [ ] Aggiungere dashboard admin autoscuola
- [ ] Implementare webhook Satispay
- [ ] Aggiungere test automatici
- [ ] Migliorare UI/UX con animazioni
- [ ] Aggiungere statistiche e grafici

## 🤝 Supporto

Per problemi o domande:
- Controlla le issues esistenti
- Apri una nuova issue descrivendo il problema

## 📄 Licenza

Proprietaria - Tutti i diritti riservati

---

Creato con ❤️ per facilitare gli allievi autoscuola nel realizzare il loro sogno della patente! 🚗
