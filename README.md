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
- `/privacy-cookie` privacy/cookie demo e gestione consenso
- `/**` pagina 404

## Funzionalita

- Mappa centrata su San Giovanni Lipioni con marker da `places.json`, basati su punti nominati OpenStreetMap quando disponibili
- Lista luoghi accessibile anche senza usare la mappa
- Filtri per categoria e ricerca testuale
- Schede luogo con note fonte OSM/ODbL e indicazione di cosa resta editoriale
- Itinerari collegati alla mappa via query param
- Racconti mock collegati ai luoghi
- Chatbot integrato basato su `chatbot-knowledge.json`, luoghi JSON e racconti mock
- Caso fallback quando il chatbot non ha informazioni sufficienti
- Lingua IT/EN/FR con selettore dropdown e preferenza salvata
- SEO base per pagina, canonical e JSON-LD minimale
- Cookie banner granulare con analytics/marketing disattivati di default
- `AnalyticsService` mock senza script terzi caricati

## Struttura dati

```text
src/assets/data/
  categories.json
  places.json
  itineraries.json
  stories.json
  chatbot-knowledge.json
src/assets/i18n/
  it.json
  en.json
```

Le immagini in `src/assets/images` sono asset dimostrativi sostituibili con foto reali autorizzate.

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

- Build command: `npm install && npm run build`
- Publish directory: `dist/radici-san-giovanni-lipioni/browser`
- Rewrite SPA: `/* -> /index.html` tramite `public/_redirects`

## SEO e GDPR

La demo include title e meta description per pagina, canonical URL, `robots.txt`, `sitemap.xml`, cookie banner e pagina privacy/cookie. Il testo privacy e cookie e solo un modello dimostrativo e deve essere validato da un consulente legale prima della pubblicazione definitiva.

## Roadmap

- Aggiunta foto reali autorizzate
- Coordinate precise dei luoghi
- Raccolta racconti reali con consenso
- Backend per gestione contenuti
- Chatbot AI con RAG
- CMS
- PWA
- Itinerari avanzati
- Audio-guide
- Collaborazione con associazioni locali

## Disclaimer

Questo progetto e una demo tecnica e culturale. Non inventa dati storici specifici e non deve essere usato come guida ufficiale senza verifica delle fonti, revisione legale e autorizzazioni sui contenuti reali.
