# Tavola

Applicazione in italiano per due piani alimentari personali e una lista della spesa condivisa.

## Pubblicare la versione completa

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ejaubashi/t010)

La configurazione `render.yaml` collega il codice GitHub a un server Node.js con disco persistente da 1 GB, regione Francoforte, controllo di salute e accesso protetto. **Il servizio Starter e il disco sono a pagamento**: verifica e approva i costi mostrati da Render prima di creare il servizio. Nessun servizio viene creato dal semplice caricamento di questo repository.

1. Apri il pulsante di deploy e accedi al tuo account Render.
2. Collega GitHub e seleziona questo repository, se richiesto.
3. Imposta `TAVOLA_ACCESS_PASSWORD` con almeno 12 caratteri nei campi sicuri di Render. Non inserire la password nel codice o in chat.
4. Controlla i costi e avvia il deploy. Al termine Render assegna un indirizzo HTTPS `…onrender.com`: quello è il link da usare su entrambi i telefoni.

All’apertura il browser chiede le credenziali: nome utente **tavola**, password quella impostata su Render. Condividi la password solo con la tua partner. Entrambi usate lo stesso link per sincronizzare la spesa. Il disco conserva il database anche quando l’app viene riavviata o aggiornata. I deploy automatici sono disattivati: gli aggiornamenti successivi si avviano dalla dashboard Render.

La configurazione è pronta nel repository; questo documento non indica che un servizio sia già stato attivato. **GitHub Pages non può eseguire il server Node.js**, quindi non offre questa versione con sincronizzazione. Non è prevista una sostituzione con dati locali al dispositivo.

Per un altro hosting compatibile è incluso anche un `Dockerfile`. Occorrono Node 24, HTTPS, una singola istanza, un volume persistente montato nella directory `TAVOLA_DATA_DIR` e la variabile segreta `TAVOLA_ACCESS_PASSWORD`. Il controllo di salute pubblico è `/healthz`; pagine, API e aggiornamenti condivisi richiedono la password.

## Avvio

Richiede Node.js 24 o successivo (usa `node:sqlite`).

```sh
npm install
npm run dev
```

Apri http://localhost:3000 sul computer che esegue il server. Questo indirizzo non rende l’app accessibile da altri dispositivi su Internet. Per una build di produzione: `npm run build`, imposta la variabile segreta `TAVOLA_ACCESS_PASSWORD` con almeno 12 caratteri e avvia `npm start`. Nessuna pubblicazione è automatica.

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

Questa versione rappresenta una singola cucina condivisa. In produzione l’accesso è protetto da una password comune, obbligatoria all’avvio; account individuali e inviti non sono inclusi. In sviluppo locale la password è facoltativa. Due dispositivi devono collegarsi alla stessa istanza del server per condividere i dati. Non utilizzare più istanze con database separati.

Nomi e piani iniziali sono esempi modificabili. I valori nutrizionali sono indicativi, non prescrizioni. Le fotografie sono illustrative e sono state generate per questo progetto.

## Verifica

```sh
npm run build
npm test
```

I test Playwright usano `/usr/bin/chromium`, oppure il percorso impostato in `CHROMIUM_PATH`, e un database separato in `/tmp/tavola-e2e-data`. Prima dei test esegui la build. Coprono isolamento dei profili, aggregazione delle quantità, salvataggio, aggiornamenti tra finestre, ricerca, mobile, validazione degli input, accesso protetto e conservazione dei dati dopo il riavvio di produzione.

I font DM Sans e Cormorant Garamond sono distribuiti con licenza SIL Open Font License. Icone Lucide: ISC.
