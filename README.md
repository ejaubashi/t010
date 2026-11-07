# Tavola

Applicazione in italiano per due piani alimentari personali e una lista della spesa condivisa.

## Avvio

Richiede Node.js 24 o successivo (usa `node:sqlite`).

```sh
npm install
npm run dev
```

Apri http://localhost:3000. Per la build locale di produzione: `npm run build` e `npm start`. Nessuna pubblicazione è automatica.

## Funzioni

- Due profili modificabili, giorni e pasti separati, porzioni personali.
- Ricettario con ricerca, preferiti, ingredienti e preparazione.
- Aggiunta, sostituzione, rimozione dei pasti e registrazione del consumo.
- Lista della spesa generata da entrambi i piani, per settimana o giorno selezionato.
- Quantità aggregate per ingrediente e unità; dettaglio dei pasti di provenienza.
- Articoli extra, acquisti spuntati, ingredienti già in casa e modalità spesa.
- Database SQLite su disco e aggiornamento delle finestre tramite Server-Sent Events.
- Interfaccia responsive, dialoghi con gestione del focus e navigazione da tastiera.

I dati sono in `.data/tavola.sqlite`, esclusi da Git. `TAVOLA_DATA_DIR` permette di cambiare directory; `PORT` cambia porta. Gli articoli spuntati restano tali quando cambia la quantità: il controllo dell’acquisto rimane esplicito.

Questa versione rappresenta una singola cucina condivisa: non comprende autenticazione o inviti. Prima di un utilizzo pubblico con dati personali servono accesso protetto e un sistema di appartenenza alla coppia. Due dispositivi devono collegarsi alla stessa istanza del server per condividere i dati.

Nomi e piani iniziali sono esempi modificabili. I valori nutrizionali sono indicativi, non prescrizioni. Le fotografie sono illustrative e sono state generate per questo progetto.

## Verifica

```sh
npm run build
npm test
```

I test Playwright usano `/usr/bin/chromium`, oppure il percorso impostato in `CHROMIUM_PATH`, e un database separato in `/tmp/tavola-e2e-data`. Coprono isolamento dei profili, aggregazione delle quantità, salvataggio, aggiornamenti tra finestre, ricerca, mobile e validazione degli input.

I font DM Sans e Cormorant Garamond sono distribuiti con licenza SIL Open Font License. Icone Lucide: ISC.
