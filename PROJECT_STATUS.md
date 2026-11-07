# Stato del progetto

## Identificazione

- Nome: San Giovanni Lipioni
- Obiettivo: guida digitale interattiva dedicata alle origini del paese, alla memoria locale, ai luoghi significativi e ai percorsi del territorio.
- Pubblico previsto: visitatori, residenti, famiglie originarie, discendenti e utenti interessati a borghi, paesaggio, architettura e turismo lento.
- Repository: https://github.com/federicocroletti-tech/radici-san-giovanni-lipioni.git
- Branch: main
- Deployment previsto: Render Static Site (configurazione presente in `render.yaml`)
- Tecnologie: Angular 22, TypeScript, SCSS, Leaflet, Capacitor, JSON statici, i18n locale, SSR Angular

## Baseline verificata

- Data aggiornamento: 2026-11-05
- Baseline tecnica originaria: commit `7132daf` ("Add SSR support and refresh village content")
- Ultimo commit verificato prima di questo aggiornamento documentale: `43e6569` (`test(data): validate place coordinates`)
- Ambiente: Windows 11, Node.js 22.22.3, npm 10.9.8
- Comandi eseguiti:
  - `git status --short --branch`
  - `npm test` (pool `threads` ancora in esecuzione senza risultati dopo circa 2 minuti; interrotto, quindi non superato)
  - `npm run build`
  - `npm run validate:place-coordinates`
  - `npm run test:place-coordinates`
  - `node ./node_modules/vitest/vitest.mjs run src/app/app.spec.ts src/app/core/services/chatbot.service.spec.ts --environment jsdom --globals --pool vmThreads --maxWorkers=1 --no-isolate`
  - richieste HTTP al sito Render e ai dati pubblicati.

### Avanzamento locale verificato il 2026-11-07

- Branch `main`, commit remoto iniziale `3ba9918`; worktree pulito alla ripresa.
- Aggiunti controlli per testi localizzati, categorie, relazioni tra luoghi, note fonte, testo alternativo, immagini locali e schede Markdown dichiarate.
- Il controllo coordinate rifiuta anche il placeholder comune `0,0`; questo non sostituisce una verifica dei confini comunali.
- Aggiunto `src/assets/data/image-assets.json`: inventario degli 8 file immagine con natura, stato documentale e campi autore/fonte/licenza/attribuzione. Le foto hanno solo la dichiarazione d'autorizzazione dell'utente; tali dettagli restano mancanti. Anche i diritti dei segnaposto restano non documentati.
- Il validatore richiede che ogni immagine assegnata a un luogo sia nell'inventario; se un record dichiara diritti documentati, richiede autore, fonte, licenza e attribuzione.
- Configurato `npm test` con il pool Vitest `vmThreads` che ha superato la suite applicativa; il build Render ora esegue validazione dati e test prima del build di produzione.
- Verifiche superate: `npm run test:place-validation` (9 test), `npm test` (7 test), `npm run validate:places` (15 schede, 8 asset inventariati; 8 schede con coordinate e 7 senza), `npm run build`, controllo Prettier e `git diff --check`.
- La build include il manifesto tra gli asset statici. I controlli assicurano coerenza strutturale e presenza dei file, non verificano l'accuratezza storica, i diritti d'uso o l'esattezza geografica.
- Produzione verificata: il sito Render e l'endpoint `https://radici-san-giovanni-lipioni.onrender.com/assets/data/image-assets.json` rispondono HTTP 200 e il manifesto pubblicato contiene gli asset inventariati.

### Validazione e rilascio del 2026-11-07

- Suite completa esistente: `npm test`, 7 test superati. Il comando usa `vmThreads` e `--no-isolate`, configurazione che evita il blocco già osservato con il pool `threads`.
- Validatori: `npm run validate:places` supera il controllo di 15 schede (8 con coordinate, 7 senza) e 8 asset inventariati; `npm run test:place-validation` supera 9 test.
- Build: `npm run build` superato, con 5 route prerenderizzate.
- Deploy Render: `render.yaml` e `DEPLOYMENT.md` eseguono ora `npm ci`, validazione dati, test di validazione, `npm test` e build in sequenza prima della pubblicazione. Il deploy statico è automatico al push sul branch configurato.
- Deploy del commit `cbf09ab` verificato: manifesto immagini HTTP 200 con 8 record identici al repository; home, `/esplora`, `/itinerari`, `/racconti` e `/privacy-cookie` rispondono tutti HTTP 200. `Last-Modified` del manifesto: 2026-11-07 00:42:52 UTC.
- Le verifiche automatiche non certificano accuratezza storica, diritti d'uso, accessibilità fisica o precisione delle geometrie territoriali.

### Passaggio per la prossima sessione

- Ultimo stato remoto prima del presente aggiornamento: branch `main`, commit `3ba9918`; il presente aggiornamento aggiunge i controlli automatizzati al deploy Render.
- Modifiche già pubblicate in questa serie: `b0df64f` (baseline), `a6e77c4` e `9f9cfe3` (inventario immagini), `83b780c` (segnaposto), `18b1263` (flag di verifica), `bf13831` (autorizzazione dichiarata), `05409a2` (rimozione coordinate placeholder), `43e6569` (validatore coordinate).
- Stato dati: 15 luoghi; 8 localizzati, 7 record `research` senza coordinate; nessun riferimento JPG nei record; le due fotografie JPG rimangono nel repository ma non sono associate alle schede.
- Stato build/test: eseguire `npm run validate:places`, `npm run test:place-validation`, `npm test` e `npm run build`; la configurazione Render applica questi gate prima della pubblicazione.
- Stato online: deploy di `cbf09ab` verificato con tutte le route principali HTTP 200 e il manifesto pubblicato identico a quello locale.
- Prossima attività suggerita: acquisire dall'utente i dettagli verificabili di autore, fonte, licenza e attribuzione delle immagini; raccogliere fonti locali puntuali per le schede e le geometrie verificate, senza inventare metadati o riscontri.
- Alla ripresa, verificare `git status`, branch e upstream; usare questo documento per riprendere dal prossimo controllo dati e non ripetere le attività già pubblicate.

### Risultati chiave

- VERIFICATO: la build Angular di produzione completa correttamente e genera `dist/radici-san-giovanni-lipioni`.
- VERIFICATO: il progetto è un front-end statico con pagine Angular, mappe Leaflet e dati JSON locali.
- VERIFICATO: il branch di lavoro è `main`, con tracking su `origin/main`; al controllo iniziale il worktree era pulito e `HEAD` coincideva con il remoto al commit `43e6569`.
- VERIFICATO: il sito Render `https://radici-san-giovanni-lipioni.onrender.com` risponde HTTP 200; il JSON pubblicato contiene 15 luoghi, di cui 7 senza coordinate.
- VERIFICATO: i nomi degli asset JavaScript/CSS serviti dal sito corrispondono alla build locale; il commit `43e6569` aggiunge solo validazione dati/documentazione rispetto al commit funzionale `05409a2`.
- DEDOTTO: il progetto è ancora una demo tecnica/culturale, non una pubblicazione editoriale definitiva.
- DICHIARATO: testi storici e contenuti editoriali richiedono ulteriore verifica con fonti locali/documentarie.
- VERIFICATO: la documentazione e il codice concordano sul fatto che i contenuti storici e le immagini devono essere controllati prima di pubblicazione definitiva.

## Funzionalità presenti

- Home con CTA, card e presentazione del borgo.
- Pagina `esplora` con mappa Leaflet, marker, filtri, ricerca e dettaglio luogo.
- Pagina `itinerari` con una struttura di dati dedicata e card tematiche.
- Pagina `racconti` con filtri e contenuti mock collegati ai luoghi.
- Pagina `privacy-cookie` con banner granulare e preferenze.
- 404 dedicata.
- Supporto multi-lingua IT/EN/FR con preferenza salvata in `localStorage`.
- Chatbot globale con conoscenza basata sui JSON del progetto.
- SEO base e `robots.txt`/`sitemap.xml`.
- Capacitor per Android/iOS.
- File statici in `src/assets/data` e contenuti markdown dedicati ai luoghi.

## Funzionalità parziali

- La mappa usa Leaflet; gli 8 record con coordinate vengono mostrati come marker. I 7 record `research` senza coordinate restano selezionabili dalla lista, ma non vengono presentati come posizioni geografiche.
- I contenuti di paesaggio, storia e architettura sono in parte editorializzati ma non ancora supportati da una documentazione storica completa.
- Le immagini esistenti sono asset dimostrativi e non sempre attribuibili o verificabili per uso finale.
- Il chatbot è funzionale come mock, ma deve restare vincolato a dati verificati e non inventare informazioni pratiche non confermate.
- La privacy/cookie è implementata come demo; la conformità legale effettiva richiede consulenza professionale.

## Funzionalità mancanti

- Completare l’inventario delle fonti, delle licenze e delle attribuzioni per tutti i luoghi e gli asset.
- Verifica storica documentale per molte schede dei luoghi.
- Inventario definitivo di immagini autorizzate e relative attribuzioni.
- Verifica sistematica della lista accessibile alternativa sincronizzata alla mappa.
- Itinerari verificati e non mock.
- Schema di contenuti, revisioni editoriali e workflow di validazione.
- Pipeline CI reali; i controlli automatizzati sui dati sono parziali e al momento coprono ID e coordinate.

## Architettura

- Struttura: Angular standalone components con `app.routes.ts` e pagine dedicate in `src/app/pages`.
- Shared components: header, footer, map, marker popup, place card, detail drawer, chatbot widget.
- Servizi: `places.service`, `itineraries.service`, `stories.service`, `language.service`, `seo.service`, `analytics.service`, `cookie-consent.service`, `chatbot.service`.
- Dati: JSON statici in `src/assets/data` e contenuti markdown in `src/assets/content/places`.
- Architettura coerente con una demo static site, ma non ancora con un modello editoriale o CMS verificato.

## Mappa e dati territoriali

- Implementazione: Leaflet con marker e popup da `places.json`.
- Supporto geocodifica: i principali luoghi sono basati su coordinate OSM, con note di origine in ciascun record.
- I 7 record `research` non hanno coordinate verificate; i marker e i link cartografici sono omessi finché non viene documentata una localizzazione.
- Stato: riconoscibile e funzionale come demo; necessita verifica su campo per coordinate, accessibilità, nomi corretti e rappresentazione dei luoghi.
- Rischio: la generica descrizione del territorio potrebbe sopravvalutare dati non verificati se usati come fonte definitiva.

## Contenuti storici

- Il progetto usa testo editoriale generico in diverse schede di luogo con indicazioni esplicite di verifica mancante.
- In più casi il testo indica "Informazione da verificare"; questa è una pratica corretta, ma il contenuto non è ancora sufficiente per una pubblicazione culturale definitiva.
- Non è presente un archivio di fonti strutturato e verificato per ogni luogo.
- Il nome corretto da utilizzare nel progetto è “San Giovanni Lipioni”, non varianti non supportate.

## Immagini e licenze

- Asset demo in `src/assets/images` e immagini di riferimento nei dati dei luoghi.
- Nessun inventario complessivo di origine, autore, licenza, attribuzione e utilizzo finale.
- La documentazione del progetto richiama esplicitamente il fatto che le immagini reali vanno sostituite con foto autorizzate e non devono essere inventate.
- Rischio: immagini generiche o ripetitive possono mettere in discussione l’accuratezza storica e la conformità ai diritti d’autore.

## Layout e identità visiva

- Identità: progetto coerente come app territoriale moderna e sobria.
- Layout: funzionale e leggero, ma ancora distaccato rispetto alla concretezza del borgo e alle sue trasformazioni narrative.
- Sicurezza visiva: la UI non è improvvisamente disordinata, ma la gerarchia editoriale e le card di luogo richiedono un raffinamento per aumentare calore, riconoscibilità e identità territoriale.

## Accessibilità

- Dato verificato: il progetto include renderizzazione responsiva e componenti condivisi coerenti.
- Dato verificato: i contenuti sono stati progettati per un approccio accessibile, ma non esiste una verifica sistematica con axe/Lighthouse o una checklist WCAG 2.2 completa.
- MANCANTE: lista accessibile alternativa sincronizzata con la mappa.
- MANCANTE: audit completo su focus, contrasto, semantica e comportamento mobile.

## SEO

- La piattaforma include title/meta, canonical, `robots.txt` e `sitemap.xml` in base alla documentazione.
- La struttura SEO è presente come demo; non emerge una validazione con controlli di contenuti, duplicati, schema e performance misurate su pubblico reale.

## Privacy

- Il progetto implementa un banner cookie granulare e una pagina demo di privacy/cookie.
- Il testo legale è chiaramente dichiarato come modello dimostrativo da validare con consulenza legale.
- Nessuna evidenza di analytics o servizi esterni in esecuzione; la documentazione indica che `AnalyticsService` resti mock.
- Rischio: la rimozione di script terzi non basta da sola a dichiarare una conformità legale assoluta.

## Test

- Presenza di test sommari in `src/app/app.spec.ts` e `src/app/core/services/chatbot.service.spec.ts`.
- `npm test` con il pool `threads` non termina correttamente in questa sessione Windows (nessun esito dopo circa 2 minuti); non considerarlo superato.
- Suite dei due file configurati: 7 test superati con pool `vmThreads`, `jsdom` e `--no-isolate`.
- `npm run validate:place-coordinates`: valida ID, coppie coordinate, intervalli WGS84 e coordinate duplicate; non verifica i confini comunali, per i quali manca una geometria documentata.
- `npm run test:place-coordinates`: 3 test superati con il runner integrato di Node.js.
- Build production: riuscita con `npm run build`.
- Stato: la build, i controlli dati e i test passano con i comandi alternativi indicati; il pool `threads` dello script `npm test` resta inaffidabile in questo ambiente.

## Git e GitHub

- Stato al controllo iniziale del 2026-11-05: repository pulito, branch `main`, tracking `origin/main`, `HEAD`=`origin/main`=`43e6569`. Questo aggiornamento documentale costituisce la successiva microattività da pubblicare.
- Remote: `https://github.com/federicocroletti-tech/radici-san-giovanni-lipioni.git`
- Cronologia recente: ci sono diversi commit di sviluppo su Angular e contenui geografici; nessun lavoro non salvato in locale.
- Nessuna evidenza di file sensibili o credenziali custoditi nel repository.

## Deployment

- Configurazione Render presente in `render.yaml`.
- Comando build previsto: `npm ci && npm run build`
- Publish directory: `dist/radici-san-giovanni-lipioni/browser`
- Rewrite SPA: `/* -> /index.html`
- Verifica live del 2026-11-05: homepage e JSON luoghi rispondono HTTP 200; 15 record, 7 senza coordinate. Gli asset JS/CSS corrispondono alla build locale.
- L’ultimo commit funzionale visibile negli asset verificati è `05409a2`; `43e6569` aggiunge validatore e test, non cambia l’interfaccia pubblicata.
- La configurazione Render non definisce nel repository una pipeline CI separata; l’esito di build/deploy automatici va verificato dopo ogni push.

## Debito tecnico

- Dati storici e geografici da verificare con fonti locali e archivistiche.
- Inventario immagini/licenze incompleto.
- I controlli automatici dei dati coprono solo ID e coordinate (coppie, intervalli e duplicati); non validano fonti, immagini, marker/schede o coordinate rispetto ai confini comunali.
- Test runner instabile in questo ambiente.
- Documentazione di progetto e fatto editoriale non ancora consolidata in un archivio unico.

## Rischi

- P0: pubblicazione di contenuti storici non verificati o immagini non autorizzate.
- P1: marker o dati geografici incoerenti o incompleti.
- P1: contenuti editoriali generici o non verificati.
- P2: layout poco riconoscibile per il territorio e poca profondità narrativa.
- P2: accessibilità mappa/lista non ancora sistematicamente verificata.
- P3: mantenimento/estensione di dati mock senza un workflow gestionale chiaro.

## Decisioni aperte

- Definire se la prima versione vuole essere una demo tecnica o una pubblicazione culturale semi-ufficiale.
- Stabilire il modello di gestione immagini e licenze prima di pubblicazione.
- Decidere se la mappa deve rimanere un centro narrativo di base o diventare un sistema di esplorazione più ricco.
- Scegliere il livello di dettaglio storico da pubblicare nei contenuti e quanto lasciare a revisione locale/archivistica.

## Roadmap

### P0

1. Controllo e aggiornamento del flusso di validazione dei contenuti storici e immagini
   - Motivazione: prevenire pubblicazione di dati non verificati o immagini non autorizzate.
   - Evidenza: README e documentazione specificano il vincolo di verificare le fonti.
   - Area: `src/assets/data`, `src/assets/content`, immagini e documentazione.
   - Dipendenze: inventario immagini, fonti, aggiornamento dati.
   - Rischio: alto.
   - Complessità: M.
   - Criteri di accettazione: ogni luogo ha fonti, immagine verificata o placeholder dichiarato, e attributi di licenza.
   - Test richiesti: controllo dati e audit immagini.

### P1

2. Estendere i controlli automatici ai record, immagini, fonti e schede
   - Motivazione: intercettare riferimenti editoriali o asset mancanti prima della pubblicazione.
   - Evidenza: il controllo attuale verifica ID e coordinate, ma non fonti, immagini, marker/schede o coordinate rispetto ai confini comunali.
   - Area: `src/assets/data/places.json`, `src/assets/content/places`, `src/assets/images`, script di validazione.
   - Dipendenze: inventario strutturato di fonti e attribuzioni.
   - Rischio: medio-alto.
   - Complessità: M.
   - Criteri di accettazione: record coerenti, riferimenti immagine esistenti, fonti e schede presenti dove dichiarate; nessuna coordinata placeholder.
   - Test richiesti: `npm run validate:place-coordinates`, test automatici per i controlli aggiunti e verifica visuale della mappa.
   - Stato: controlli strutturali aggiunti localmente; restano necessari verifica editoriale e sopralluogo per validare i contenuti e le posizioni.

3. Completare la revisione di immagini e diritti
   - Motivazione: evitare uso improprio di immagini e perdita di fiducia dell’utente.
   - Evidenza: repository non presenta inventario completo di licenze e sorgenti.
   - Area: `src/assets/images`, `places.json`, documentazione immagini.
   - Dipendenze: acquisizione autorizzazioni o placeholder.
   - Rischio: alto.
   - Complessità: M.
   - Stato: i record luogo usano illustrazioni segnaposto al posto delle foto non specifiche; le due fotografie JPG restano nel repository ma non sono referenziate. L’utente ha dichiarato l’uso autorizzato; fonte, licenza specifica e attribuzione sono ancora mancanti.
   - Criteri di accettazione: ogni immagine pubblicata ha provenienza, diritti e attribuzione documentati, oppure resta un segnaposto.
   - Test richiesti: inventario immagini e controllo di dato.

### P2

4. Migliorare la gerarchia visiva e l’identità territoriale del layout
   - Motivazione: rendere l’esperienza più concreta e meno anonima.
   - Evidenza: README e requisiti indicano la necessità di calore, identità e concretezza territoriale.
   - Area: `src/app/shared/components`, `src/styles.scss`, `app.scss`.
   - Dipendenze: design token e revisione pagine chiave.
   - Rischio: medio.
   - Complessità: M.
   - Criteri di accettazione: hierarchia chiara, card coerenti, responsive e accessibile.
   - Test richiesti: controllo visivo desktop/tablet/mobile.

5. Completare la lista accessibile alternativa alla mappa
   - Motivazione: migliorare accessibilità e fruizione senza esclusiva mappa.
   - Evidenza: requisito del progetto e linee guida WCAG 2.2.
   - Area: `ExplorePage`, componenti di mappa, lista filtri.
   - Dipendenze: normalizzazione dati luoghi.
   - Rischio: medio.
   - Complessità: M.
   - Criteri di accettazione: elenco sincronizzato con mappe, navigabile da tastiera, senza contenuti duplicati.
   - Test richiesti: accessibilità manuale e test automatici.

### P3

6. Progettare e introdurre itinerari verificati e non mock
   - Motivazione: trasformare il progetto da demo in esperienza narrativa robusta.
   - Evidenza: il progetto già include `itineraries.json` e pagine dedicate.
   - Area: `src/assets/data/itineraries.json`, `src/app/pages/itineraries`, componenti correlati.
   - Dipendenze: coordinamento di luoghi e fonti.
   - Rischio: medio.
   - Complessità: L.
   - Criteri di accettazione: tutte le tappe hanno fonti, distanze e tempi dichiarati verificati.
   - Test richiesti: controllo dati e verifica editioriale.

7. Consolidare SEO, privacy e performance
   - Motivazione: rendere il sito più sostenibile, leggibile e conforme ai requisiti digitali.
   - Evidenza: documentazione del progetto indica SEO e privacy come parte del vincolo.
   - Area: `src/app/core/services/seo.service.ts`, `privacy-cookie` e build finali.
   - Dipendenze: audit legale, performance, schema.
   - Rischio: medio.
   - Complessità: M.
   - Criteri di accettazione: controlli SEO e privacy documentati e validati.
   - Test richiesti: build, Lighthouse, audit privacy.

## Sintesi dello stato

Il progetto è in una fase di baseline funzionante ma non ancora definitiva: costruzione front-end stabile, build di produzione riuscita, documentazione chiara sui vincoli, ma dati territoriali, immagini, fonti e verifica storica ancora da consolidare. La priorità immediata è la normalizzazione e la verifica dei contenuti prima di ogni ulteriore evoluzione estetica o narrativa.
