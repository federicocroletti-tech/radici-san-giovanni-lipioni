# PROJECT_REQUIREMENTS.md

Fonte vincolante: prompt allegato `PROMPT_RADICI_SAN_GIOVANNI_LIPIONI.md` fornito dall'utente.

## Progetto

**Radici San Giovanni Lipioni - Guida digitale interattiva del borgo**

Applicazione frontend Angular dedicata a San Giovanni Lipioni, pensata per visitatori, abitanti, persone emigrate, discendenti di famiglie originarie del paese e utenti interessati a borghi, memoria, tradizioni e turismo lento.

## Vincoli principali

- Angular moderno con standalone components.
- TypeScript e SCSS.
- Leaflet per la mappa interattiva.
- Nessun backend reale nella prima versione.
- Dati mock statici in `src/assets/data`.
- Testi UI in `src/assets/i18n/it.json`, `src/assets/i18n/en.json` e `src/assets/i18n/fr.json`.
- Lingua default: italiano; lingua selezionata salvata in localStorage.
- Coordinate dei luoghi principali possono usare OpenStreetMap come base pubblica; testi storici, racconti e accessibilita restano da verificare con fonti locali.
- Non inventare date, tradizioni, eventi, personaggi storici o dati amministrativi.
- Chatbot mock basato solo sui JSON del progetto.
- Se il chatbot non trova una risposta, deve dichiarare che non ha informazioni sufficienti.
- Analytics e marketing non devono essere caricati prima del consenso.
- `AnalyticsService` resta mock nella prima versione.
- Progetto deployabile come static site su Render.

## Pagine richieste

- Home `/`
- Esplora `/esplora`
- Itinerari `/itinerari`
- Racconti `/racconti`
- Privacy e Cookie `/privacy-cookie`
- 404 `/**`

## File dati richiesti

- `src/assets/data/places.json`
- `src/assets/data/itineraries.json`
- `src/assets/data/stories.json`
- `src/assets/data/chatbot-knowledge.json`
- `src/assets/data/categories.json`

## Funzionalita richieste

- Header, footer, selettore lingua, cookie banner e chatbot globale.
- Home con CTA mappa/chatbot, card principali e luoghi in evidenza.
- Esplora con mappa Leaflet, marker, lista, filtri, ricerca e dettaglio luogo.
- Mobile con tab mappa/lista e dettaglio luogo compatibile con viewport piccolo.
- Itinerari con durata, difficolta, tappe e apertura sulla mappa.
- Racconti mock filtrabili per tema e collegati ai luoghi.
- Privacy/cookie con disclaimer legale e gestione preferenze.
- SEO base per pagina, canonical URL, Open Graph/Twitter base e JSON-LD minimale.
- `robots.txt` e `sitemap.xml`.

## Criteri di accettazione

- Build produzione funzionante.
- Tutte le pagine richieste presenti.
- Mappa funzionante con marker da JSON.
- UI responsive e accessibile nelle basi.
- Chatbot vincolato ai dati mock.
- Cookie banner granulare e preferenze salvate.
- README e documentazione di deploy presenti.
- TODO legali/dati reali esplicitati, non nascosti.
