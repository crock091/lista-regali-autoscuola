# Lista Regali Autoscuola - Copilot Instructions

## Panoramica Progetto
Applicazione web per autoscuola che permette agli allievi di creare liste regali natalizie per ricevere contributi da amici e parenti per pagare iscrizione e guide.

## Stack Tecnologico
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM (SQLite dev, PostgreSQL prod)
- **Autenticazione**: NextAuth.js
- **Pagamenti**: Satispay API, Bonifico Bancario
- **Email**: Nodemailer

## Struttura Database
- **Student**: id, email, password, nome, cognome, telefono, createdAt
- **GiftList**: id, studentId, titolo, descrizione, shareToken, attiva
- **GiftItem**: id, giftListId, tipo (iscrizione/guida/esame), descrizione, importoTarget, importoRaccolto
- **Contribution**: id, giftItemId, nome, importo, metodoPagamento, stato, dataContributo
- **Payment**: id, contributionId, transactionId, stato, metadata

## Funzionalità Chiave
1. Registrazione/Login allievi
2. Creazione lista regali personalizzata
3. Generazione link condivisione unico
4. Pagina pubblica per contributi
5. Integrazione pagamenti Satispay e bonifico
6. Tracking contributi ricevuti
7. Notifiche email
8. Dashboard admin autoscuola

## Lingua
Tutta l'interfaccia in italiano.

## Checklist Completamento
- [x] Creato copilot-instructions.md
- [ ] Scaffold progetto Next.js
- [ ] Setup Prisma database
- [ ] Implementa autenticazione
- [ ] Crea dashboard allievi
- [ ] Crea pagina condivisione pubblica
- [ ] Integra pagamenti
- [ ] Installa dipendenze e compila
- [ ] Testa applicazione
