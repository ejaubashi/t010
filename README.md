# Tavola

Un sito in italiano per due piani alimentari personali e un’unica lista della spesa, gratuito e utilizzabile dal telefono. **La versione principale è interamente statica: nessun server applicativo, database cloud o abbonamento.**

## Aprire il sito

La cartella `docs/` contiene il sito già compilato, con fotografie e font inclusi. Può essere servita da qualsiasi hosting statico gratuito.

- Link gratuito alla build pubblicata su GitHub: https://raw.githack.com/ejaubashi/t010/main/docs/index.html
- Per usare GitHub Pages direttamente: apri [Settings → Pages](https://github.com/ejaubashi/t010/settings/pages), seleziona **Deploy from a branch**, ramo **main**, cartella **/docs**. Dopo la pubblicazione, il link sarà https://ejaubashi.github.io/t010/ . L’attivazione richiede l’accesso del proprietario a GitHub; il solo push del codice non la garantisce.
- In alternativa è incluso il workflow manuale `.github/workflows/pages.yml`, utilizzabile dopo aver scelto **GitHub Actions** come sorgente Pages.

Il link Githack permette di visualizzare i file statici GitHub senza configurare Pages e dipende dalla disponibilità e dai limiti del servizio esterno. Non è stato possibile verificare il dominio esterno dall’ambiente di sviluppo, che ne blocca l’accesso. Nessuna API o password è inclusa nel sito. Per un uso continuativo è preferibile il dominio GitHub Pages.

Entrambi potete aprire lo stesso sito e vedere la lista iniziale, calcolata dai due piani di esempio. **Le modifiche ai pasti, i nomi e le spunte sono salvati solo nel browser di ciascun telefono. Non si aggiornano automaticamente sull’altro telefono.** La lista somma sempre i due piani presenti sul dispositivo utilizzato. Cancellare i dati del browser cancella anche le personalizzazioni. La versione statica non carica i dati personali nel repository.

Per ritrovare il sito rapidamente, usa “Aggiungi alla schermata Home” dal browser del telefono. Il file manifest è incluso; questa versione non garantisce la disponibilità offline dei file del sito.

## Funzioni

- Due profili con calendario, pasti e porzioni individuali.
- Ricettario con ricerca, preferiti, ingredienti e preparazione.
- Aggiunta, sostituzione, rimozione e registrazione dei pasti mangiati.
- Lista unica calcolata dai due piani, per settimana o giorno selezionato.
- Quantità aggregate per ingrediente e unità; dettaglio dei pasti di provenienza.
- Articoli extra, spunte, ingredienti già in casa e modalità spesa.
- Salvataggio locale e aggiornamento delle finestre dello stesso browser.
- Layout mobile, dialoghi con gestione del focus e navigazione da tastiera.

Nomi e piani iniziali sono esempi modificabili; i valori nutrizionali sono indicativi. Le fotografie sono illustrative e generate per questo progetto.

## Sviluppo e build statica

```sh
npm ci
npm run dev
```

L’indirizzo localhost è utilizzabile solo sul computer che esegue l’anteprima. Per pubblicare non serve lasciare acceso questo computer.

```sh
npm run build        # file statici in dist/
npm run build:pages  # aggiorna docs/ per la pubblicazione
```

I percorsi degli asset sono relativi: funziona anche sotto `/t010/` o nel percorso completo del CDN. Nessuna variabile segreta o chiamata `/api` è necessaria per la versione statica.

## Verifica

```sh
npm test
```

I test Playwright usano `/usr/bin/chromium` oppure il percorso `CHROMIUM_PATH`. Verificano il sito statico senza API, persistenza sul dispositivo, uguaglianza delle liste iniziali tra due dispositivi, isolamento delle spunte, mobile e i flussi della precedente versione con server.

## Versione precedente con server, facoltativa

Il codice Express/SQLite rimane disponibile come alternativa di sviluppo. Non è necessario per il sito statico e non è stato attivato alcun servizio a pagamento.

```sh
npm run dev:server
npm run build:server
```

Per eseguirlo in produzione servono Node 24, la variabile segreta `TAVOLA_ACCESS_PASSWORD` di almeno 12 caratteri e `npm start`. Il client va compilato con `build:server`, che scrive in `dist-server/`. Il database è in `.data/tavola.sqlite`; `TAVOLA_DATA_DIR` cambia directory e `PORT` cambia porta. La versione con server comprende spesa sincronizzata e password comune (utente `tavola`), ma non viene utilizzata dal sito statico. Il `Dockerfile` serve esclusivamente a questa alternativa.

I font DM Sans e Cormorant Garamond sono distribuiti con licenza SIL Open Font License, inclusa in `public/fonts`. Icone Lucide: ISC.
