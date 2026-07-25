# Deploy su Render

Questa app e una Angular static site senza backend.

## Impostazioni Render

- **Service type:** Static Site
- **Root directory:** lascia vuoto se il repository contiene solo questo progetto; altrimenti usa `radici-san-giovanni-lipioni`
- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist/radici-san-giovanni-lipioni/browser`

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
npm install
npm run build
```

Dopo la pubblicazione, verifica:

- home `/`
- mappa `/esplora`
- itinerari `/itinerari`
- racconti `/racconti`
- privacy/cookie `/privacy-cookie`
- refresh diretto su una route interna
- cambio lingua IT/EN
- banner cookie
