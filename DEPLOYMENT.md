# Deploy su Render

Questa app e una Angular static site senza backend.

## Impostazioni Render

- **Service type:** Static Site
- **Root directory:** lascia vuoto se il repository contiene solo questo progetto; altrimenti usa `radici-san-giovanni-lipioni`
- **Build command:** `npm ci && npm run validate:places && npm run validate:publication-ready && npm run test:place-validation && npm test && npm run build`
- **Publish directory:** `dist/radici-san-giovanni-lipioni/browser`
- **Branch:** `main`

Le pull request vengono verificate dal workflow GitHub Actions `Quality checks`, che include anche lint, audit e test browser sulla build di produzione. Prima di unire su `main`, attendere che il workflow sia completato con successo. Se il deploy automatico Render e abilitato, l'aggiornamento di `main` lo attiva; controllare anche lo stato del deploy su Render.

## Rewrite SPA

Il file `public/_redirects` contiene:

```text
/* /index.html 200
```

Serve per permettere il refresh diretto di route come `/esplora`, `/itinerari` e `/privacy-cookie`.

## Variabili ambiente

La prima versione non richiede segreti o API key. Usa `.env.example` solo come promemoria per future integrazioni.

## Controlli prima del deploy

```bash
npm ci
npm run validate:places
npm run validate:publication-ready
npm run test:place-validation
npm test
npm run lint
npm audit
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:production
```

`validate:publication-ready` e un blocco obbligatorio, non un controllo da saltare per far riuscire il deploy. Al 28 novembre 2026 il gate fallisce per coordinate e schede non verificate, itinerari non rilevati, racconti dimostrativi e immagini senza documentazione completa dei diritti. La build locale puo essere usata per QA, ma non autorizza la pubblicazione. Vedi [l'audit editoriale e la checklist di approvazione](./docs/audit-pubblicazione.md).

Il sito Render usa solo i file statici. Per l'avvio opzionale del server Node (`npm run serve:ssr:radici-san-giovanni-lipioni`), gli host locali sono consentiti. Su un dominio pubblico, configurare `NG_ALLOWED_HOSTS` con l'elenco dei soli nomi host autorizzati separati da virgole, senza schema o porta; non usare un wildcard.

## Integrita delle immagini PWA

Il service worker verifica l'hash degli asset prima di salvarli offline. L'ottimizzazione automatica delle immagini della CDN puo modificare JPEG e PNG dopo la build, causando un errore `Hash mismatch` e impedendo il completamento della cache.

`render.yaml` imposta `Cache-Control: public, max-age=0, s-maxage=300, no-transform` per `/branding/*`, `/icons/*`, `/assets/images/*` e `/favicon.ico`. Questo mantiene la cache CDN senza permettere trasformazioni dei file.

Se il servizio non e gestito da un Blueprint sincronizzato, aggiungere gli stessi quattro header in **Render Dashboard > servizio > Headers**: un header `Cache-Control` per ogni percorso, con il valore indicato sopra. Il solo deploy del codice non aggiorna le impostazioni di un servizio configurato manualmente.

Verificare sul sito pubblicato che gli header includano `no-transform`, che gli asset corrispondano agli hash del manifesto live `/ngsw.json` e che `/ngsw/state` riporti `Driver state: NORMAL` dopo il completamento della cache. Infine disattivare la rete e ricaricare Esplora, controllando anche il logo.

Dopo la pubblicazione, verifica:

- home `/`
- mappa `/esplora`
- itinerari `/itinerari`
- racconti `/racconti`
- cronologia `/cronologia` e registro fonti `/fonti`
- privacy/cookie `/privacy-cookie`
- refresh diretto su una route interna
- cambio lingua IT/EN/FR
- banner cookie
- preferiti, luoghi visitati e link condivisibili
- ricaricamento offline dopo il completamento della cache (tile della mappa escluse)
