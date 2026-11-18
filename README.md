# Radici San Giovanni Lipioni

Guida digitale interattiva dedicata a San Giovanni Lipioni, costruita come demo Angular moderna per valorizzare borgo, radici familiari, memoria locale e turismo lento.

Il progetto usa file JSON locali e testi UI da file i18n. I marker principali sono stati riallineati a elementi pubblici OpenStreetMap; racconti, descrizioni editoriali e contenuti storici devono comunque essere verificati con fonti locali prima della pubblicazione reale.

## Stack

- Angular 22 standalone components
- TypeScript
- SCSS
- Leaflet per la mappa
- Capacitor per packaging mobile Android/iOS dalla stessa app Angular
- JSON statici in `src/assets/data`
- i18n custom con `src/assets/i18n/it.json`, `src/assets/i18n/en.json` e `src/assets/i18n/fr.json`
- localStorage per lingua e preferenze cookie
- Render Static Site ready

## Pagine

- `/` Home emozionale e informativa
- `/esplora` mappa Leaflet, marker, ricerca, filtri e dettaglio luogo
- `/itinerari` tre itinerari mock
- `/racconti` racconti dimostrativi e temi filtrabili
- `/cronologia` eventi storici, sismici, persone, emigrazione e tradizioni orali, ciascuno con fonti e stato di verifica
- `/fonti` registro delle fonti consultate
- `/privacy-cookie` privacy/cookie demo e gestione consenso
- `/**` pagina 404

## Funzionalita

- Mappa centrata su San Giovanni Lipioni con marker da `places.json`, basati su punti nominati OpenStreetMap quando disponibili
- Lista luoghi accessibile anche senza usare la mappa
- Filtri per categoria e ricerca testuale
- URL condivisibili per ricerca, categoria, itinerario e luogo selezionato
- Vista mobile accessibile con schede mappa/lista
- Geolocalizzazione attivata solo su richiesta, senza memorizzare la posizione
- Preferiti e luoghi visitati salvati localmente sul dispositivo
- Schede luogo con note fonte OSM/ODbL e indicazione di cosa resta editoriale
- Itinerari collegati alla mappa via query param
- Racconti mock collegati ai luoghi
- Chatbot IT/EN/FR che usa schede luogo, itinerari e racconti, con suggerimenti generali e collegamenti cliccabili alla mappa
- Il chatbot distingue i contenuti disponibili dalle informazioni pratiche non verificate e dichiara quando non trova una risposta
- La conversazione puo essere riavviata e mantiene visibili i messaggi piu recenti
- Lingua IT/EN/FR con selettore dropdown e preferenza salvata
- SEO base per pagina, canonical e JSON-LD minimale
- Cookie banner granulare con analytics/marketing disattivati di default
- `AnalyticsService` mock senza script terzi caricati
- PWA con shell, dati, traduzioni e immagini gia consultate disponibili offline
- Le tile OpenStreetMap restano online e non vengono memorizzate offline

## Struttura dati

```text
src/assets/data/
  categories.json
  places.json
  image-assets.json
  sources.json
  itineraries.json
  stories.json
  chatbot-knowledge.json
src/assets/i18n/
  it.json
  en.json
```

Le immagini in `src/assets/images` sono asset dimostrativi sostituibili con foto reali autorizzate.

Il marchio nell'intestazione, la favicon e le icone PWA derivano dal logo Instagram gia presente in `social/instagram/primo-carosello/source/assets/logo-radici-instagram.png`. Per rigenerare gli asset web ottimizzati senza modificare l'originale, esegui `powershell -ExecutionPolicy Bypass -File scripts/generate-brand-assets.ps1` su Windows. Le icone PWA includono un margine per il ritaglio maskable e sono disponibili anche offline.

## Fonti geografiche

I luoghi principali in `places.json` usano nomi e coordinate ricavati da OpenStreetMap tramite Overpass, con note fonte nei singoli record. I dati OSM sono disponibili sotto Open Database License (ODbL). Prima di pubblicare una guida ufficiale, verificare sul posto coordinate, accessibilita, apertura e contenuti descrittivi.

## Avvio locale

```bash
npm install
npm start
```

Apri `http://localhost:4200/`.

## Build

```bash
npm run build
```

Output: `dist/radici-san-giovanni-lipioni/browser`.

## Controlli di qualita

```bash
npm test
npm run lint
npm run test:e2e
npm run test:production
```

I test browser usano Playwright. Al primo avvio, installa Chromium con `npx playwright install chromium`.

Il workflow GitHub Actions `Quality checks` esegue installazione pulita, lint, validazione e test dei dati, test unitari, audit delle dipendenze, test browser e controlli del server sulla build di produzione per ogni pull request e aggiornamento di `main`. I test browser avviano un server dedicato sulla porta 4000; `test:production` richiede una build gia generata e verifica le route di produzione e il rifiuto di host non autorizzati sulla porta 4188. Queste porte devono essere libere. In caso di errore, le tracce browser sono disponibili negli artefatti del workflow per 7 giorni.

La regressione responsive verifica anche che i controlli di Esplora non si sovrappongano o escano dal pannello a 320, 390, 768, 1024, 1280 e 1440 pixel, in italiano, inglese e francese. Screenshot e tracce vengono salvati in caso di errore.

## Uso offline

In produzione il service worker rende disponibili offline l'applicazione, i dati JSON e le traduzioni; le immagini vengono memorizzate dopo il primo accesso. Le tile della mappa sono fornite da OpenStreetMap e restano online: non vengono precacheate o memorizzate, quindi la mappa cartografica richiede una connessione.

## Validazione dei dati dei luoghi

Prima di pubblicare modifiche alle schede, esegui:

```bash
npm run validate:places
npm run test:place-validation
```

I controlli verificano coordinate plausibili senza duplicati o placeholder `0,0`, categorie e relazioni esistenti, testi e note fonte in italiano, inglese e francese, immagini locali presenti in `image-assets.json` e schede Markdown quando dichiarate. Il manifesto distingue segnaposto e fotografie e registra esplicitamente le provenienze o i diritti ancora da documentare.

`sources.json` e il registro delle fonti editoriali. Ogni voce deve riportare ID, titolo, citazione, creatore o ente editore, URL quando disponibile, data di consultazione e una o piu affermazioni collegate agli ID dei luoghi supportati. Una scheda puo essere marcata `verified` solo se almeno una voce del registro supporta esplicitamente quel luogo. Le schede `to-verify` e `research` restano ammesse; il registro iniziale e vuoto finche non vengono raccolti riferimenti verificabili. I controlli non certificano da soli accuratezza storica, geografica o giuridica.

## App mobile

Il progetto usa Capacitor per mantenere un'unica codebase: ogni modifica a componenti, servizi, stili o contenuti Angular viene inclusa sia nel sito sia nell'app mobile dopo build e sync.

Prima configurazione Android:

```bash
npm run mobile:add:android
```

Aggiornamento app mobile dopo modifiche al sito:

```bash
npm run mobile:build
```

Build APK debug Android:

```bash
npm run mobile:android:debug
```

La build Android richiede Android Studio o Android SDK installato. Se Gradle segnala che non trova l'SDK, impostare `ANDROID_HOME` oppure creare `android/local.properties` con `sdk.dir=...` puntato alla cartella SDK locale.

Avvio su Android da Capacitor:

```bash
npm run mobile:android
```

Per iOS e necessario usare macOS con Xcode:

```bash
npm run mobile:add:ios
npm run mobile:ios
```

## Deploy Render

Vedi `DEPLOYMENT.md`.

Configurazione consigliata:

- Build command: `npm ci && npm run validate:places && npm run test:place-validation && npm test && npm run build`
- Publish directory: `dist/radici-san-giovanni-lipioni/browser`
- Rewrite SPA: `/* -> /index.html` tramite `public/_redirects`

## SEO e GDPR

La demo include title e meta description per pagina, canonical URL, `robots.txt`, `sitemap.xml`, cookie banner e pagina privacy/cookie. Il testo privacy e cookie e solo un modello dimostrativo e deve essere validato da un consulente legale prima della pubblicazione definitiva.

## Sviluppi futuri

- Aggiunta foto reali autorizzate
- Coordinate precise dei luoghi
- Raccolta racconti reali con consenso
- Backend per gestione contenuti
- Chatbot AI con RAG
- CMS
- Itinerari avanzati
- Audio-guide
- Collaborazione con associazioni locali

## Disclaimer

Questo progetto e una demo tecnica e culturale. Non inventa dati storici specifici e non deve essere usato come guida ufficiale senza verifica delle fonti, revisione legale e autorizzazioni sui contenuti reali.
