# Piano operativo — evolutive Radici

**Data:** 2026-11-26  
**Specifica:** richieste raccolte in chat il 2026-11-26  
**Stato:** Fase 1 completata; fasi backend/CMS e RAG differite per scelta utente; offline/export in corso

## Sintesi

Estendere la guida Angular/Capacitor con ascolto di racconti, itinerari e luoghi dalla mappa; poi introdurre una piattaforma editoriale con workflow, pacchetti offline, esportazioni e chatbot RAG. L'app attuale usa JSON statici e una PWA: la prima fase resta indipendente da backend e servizi esterni; le fasi successive introdurranno le decisioni infrastrutturali necessarie.

## Contesto tecnico

- **Stack:** Angular 22 standalone, TypeScript, SCSS, Capacitor.
- **Contenuti attuali:** JSON sotto `src/assets/data`, localizzazioni UI IT/EN/FR in `src/assets/i18n`.
- **Offline attuale:** shell e dati della guida sono precaricati; immagini consultate possono essere memorizzate; tile OpenStreetMap restano online.
- **Deploy attuale:** sito statico Render; non esiste un backend o un CMS.
- **Prima implementazione audio:** Web Speech API del dispositivo, attivata solo dall'utente. È un MVP senza file audio e la disponibilità/qualità delle voci dipende da browser, sistema operativo e lingua installata. In seguito il CMS potrà servire audio revisionati e scaricabili.
- **Vincoli:** non pubblicare contenuti non verificati come verificati; non attivare microfono, geolocalizzazione o registrazione conversazioni senza un'azione esplicita e informativa adeguata.

## Verifica dei vincoli

- Nessun backend necessario per la prima fase; compatibile con i requisiti originari del frontend statico.
- Contenuti storici e racconti dimostrativi restano identificati come tali anche durante la lettura audio.
- RAG e CMS non vengono avviati prima di definire hosting, trattamento dei dati, ruoli e processo editoriale.
- Le tile cartografiche non sono incluse nei pacchetti offline senza un fornitore e una licenza che lo consentano.

## Linee guida applicate

- Riutilizzare servizi Angular e localizzazioni già presenti.
- Usare progressive enhancement: le funzioni non supportate dal browser devono dichiararlo chiaramente, senza simulare un successo.
- Mantenere accessibili da tastiera i controlli; usare etichette localizzate e stati annunciati.
- Verificare le funzionalità con i test unitari, browser e build già presenti nel progetto.

## Fasi operative

### Fase 1 — Ascolto MVP [P1]

**Requisiti:** REQ-001, REQ-002.

1.1 Introdurre un servizio audio condiviso che usa la voce di sistema, gestisce avvio/interruzione, lingua, indisponibilità e errori.  
1.2 Aggiungere ascolto/interruzione alle schede di racconti e itinerari, leggendo il testo nella lingua corrente.  
1.3 Aggiungere un pulsante dedicato “Audio-guida” alla scheda del luogo selezionato sulla mappa.  
1.4 Fermare la lettura quando si cambia pagina o luogo selezionato.  
1.5 Verificare servizio, localizzazioni e controlli audio con test unitari e browser.

**Criteri di completamento:** i controlli sono in IT/EN/FR; la lingua dell'enunciato segue quella selezionata; un solo elemento è letto alla volta; l'utente può interrompere; l'assenza del supporto è comunicata.

**Task**
- [x] T001 [US1] [Plan:1.1] Creare servizio di sintesi vocale e test unitari in `src/app/core/services/audio-guide.service.ts` e `src/app/core/services/audio-guide.service.spec.ts`
- [x] T002 [US1] [Plan:1.2] Aggiungere controlli di lettura alle schede racconto e le etichette audio IT/EN/FR in `src/app/shared/components/story-card/story-card.component.ts` e `src/assets/i18n/`
- [x] T003 [US1] [Plan:1.2] Aggiungere controlli di lettura alle schede itinerario e le etichette audio IT/EN/FR in `src/app/shared/components/itinerary-card/itinerary-card.component.ts` e `src/assets/i18n/`
- [x] T004 [US1] [Plan:1.3,1.4] Aggiungere il pulsante Audio-guida alla scheda luogo e fermare l'audio al cambio pagina in `src/app/shared/components/place-detail-drawer/place-detail-drawer.component.ts` e `src/app/pages/`
- [x] T005 [US1] [Plan:1.5] Verificare lint, test, build e flussi browser dei controlli audio

### Fase 2 — Backend, CMS e contenuti [differita]

**Requisiti:** REQ-005, REQ-006.

**Decisione utente (2026-11-27):** mantenere il progetto statico e proseguire con audio, offline ed esportazioni. Non introdurre ora API, database, CMS, account amministrativi o storage remoto. Riesaminare questa fase solo su richiesta esplicita.

2.1 Decidere CMS, hosting API/database e storage media, con costi, backup, ruoli e requisiti privacy espliciti.  
2.2 Definire API pubblica e modello per luoghi, itinerari, racconti, cronologia, fonti, traduzioni e media.  
2.3 Implementare autenticazione amministrativa, bozze, revisione, pubblicazione, audit e rollback; l'API pubblica restituisce soltanto versioni approvate.  
2.4 Migrare i JSON in modo incrementale e disaccoppiare i media dal bundle frontend.

**Criteri di completamento:** un editor può creare e revisionare contenuti; bozze non accessibili pubblicamente/offline; rollback disponibile; verifica editoriale distinta dalla verifica sul campo.

**Task differiti**
- [ ] T006 [US2] [Plan:2.1] Selezionare CMS, API, database e object storage solo dopo riapertura della fase
- [ ] T007 [US2] [Plan:2.2] Definire schema e API versionata per contenuti, fonti, localizzazioni e asset
- [ ] T008 [US2] [Plan:2.3] Implementare ruoli, stato bozza/revisione/pubblicato, audit e rollback
- [ ] T009 [US2] [Plan:2.4] Migrare gradualmente i JSON e collegare il frontend all'API pubblica
- [ ] T010 [US2] [Plan:2.4] Spostare immagini e audio in object storage con metadati di licenza, attribuzione e versione

### Fase 3 — Offline e esportazione [P2]

**Requisiti:** REQ-003, REQ-004.

3.1 Aggiungere pacchetti scaricabili per itinerario o tema: testi, immagini e, quando presenti, audio autorizzati.  
3.2 Versionare i pacchetti, mostrare spazio richiesto, lingua e data di aggiornamento; consentire aggiornamento e rimozione.  
3.3 Generare PDF stampabili e accessibili di racconti/itinerari, con fonti e crediti.  
3.4 Esportare PNG di schede/itinerari senza tagliare contenuti o omettere attribuzioni.  
3.5 Verificare uso offline, gestione spazio e rendering delle esportazioni sui dispositivi supportati.

**Criteri di completamento:** contenuti selezionati disponibili offline dopo download; stato e spazio visibili; tile cartografiche escluse salvo autorizzazione del fornitore; esportazioni testate su mobile e desktop.

**Task**
- [ ] T011 [US3] [Plan:3.1,3.2] Definire manifesto versionato e servizio di download/rimozione dei pacchetti offline
- [ ] T012 [US3] [Plan:3.1,3.2] Aggiungere UI di selezione, progresso, errori e spazio dei pacchetti
- [ ] T013 [US3] [Plan:3.3] Aggiungere esportazione PDF accessibile di itinerari e racconti
- [ ] T014 [US3] [Plan:3.4] Aggiungere esportazione PNG di schede e itinerari
- [ ] T015 [US3] [Plan:3.5] Testare aggiornamento offline e download/esportazioni su viewport mobile e desktop

### Fase 4 — Chatbot basato su fonti approvate [differita]

**Requisiti:** REQ-008, REQ-009, REQ-010, REQ-011.

**Dipendenza:** la scelta utente di mantenere il progetto statico rinvia anche RAG, moderazione lato server e registrazione domande. Il supporto vocale del chatbot resta fuori dall'attuale tranche.

4.1 Indicizzare solo fonti e contenuti approvati, rispettando lingua, licenza e versioni.  
4.2 Generare risposte con citazioni verificabili; dichiarare l'assenza di evidenza sufficiente.  
4.3 Usare la confidenza per scegliere quando rispondere o astenersi, senza esporre un punteggio ingannevole.  
4.4 Definire moderazione, minimizzazione dei dati, accessi e tempi di conservazione prima di registrare domande.  
4.5 Valutare dettatura e risposta vocale con consenso esplicito, dopo la stabilizzazione del chatbot testuale.  
4.6 Verificare retrieval, citazioni, astensione, moderazione e permessi vocali.

**Criteri di completamento:** le risposte hanno fonti consultabili; contenuti in bozza o non approvati non sono recuperabili; risposte senza evidenza sufficiente si astengono; policy e test privacy documentati.

**Task differiti**
- [ ] T016 [US4] [Plan:4.1] Costruire pipeline d'indicizzazione limitata a contenuti approvati e versionati
- [ ] T017 [US4] [Plan:4.2,4.3] Integrare RAG con citazioni verificabili, criteri di astensione e valutazione della confidenza
- [ ] T018 [US4] [Plan:4.4] Aggiungere moderazione e policy di logging/retention dopo valutazione privacy
- [ ] T019 [US4] [Plan:4.5] Aggiungere input/output vocale solo con consenso e controlli browser
- [ ] T020 [US4] [Plan:4.6] Testare isolamento bozze, citazioni, astensione, moderazione e permessi vocali

## Struttura prevista

```text
src/app/core/services/audio-guide.service.ts
src/app/core/services/audio-guide.service.spec.ts
src/app/shared/components/{story-card,itinerary-card,place-detail-drawer}/
src/assets/i18n/{it,en,fr}.json
src/app/core/services/content-api.service.ts            # Fase 2
src/app/core/services/offline-content.service.ts         # Fase 3
src/app/core/services/content-export.service.ts          # Fase 3
backend/                                                 # tecnologia da scegliere in Fase 2
```

## Strategia di verifica

- **Stack:** Vitest per servizi; Playwright per flussi browser; lint e build Angular.
- **Percorsi critici:** ascoltare/interrompere un racconto; leggere un itinerario nella lingua attiva; ascoltare il luogo selezionato; scaricare e aprire un pacchetto offline; esportare PDF/PNG; verificare che il chatbot citi solo contenuti approvati.
- **Accettazione:** nessun errore di lint/build; unit ed e2e pertinenti verdi; stati non supportati mostrati esplicitamente; navigazione e controlli accessibili da tastiera.
- **Limite della Fase 1:** i test automatizzati verificano il contratto Web Speech API, non la qualità o disponibilità delle voci installate sul dispositivo.

## Requirement Mapping

| REQ ID | Descrizione | Plan Items | Evidenza d'implementazione |
|---|---|---|---|
| REQ-001 | Ascolto di storie e itinerari | 1.1, 1.2 | `audio-guide.service.ts`, `story-card.component.ts`, `itinerary-card.component.ts` |
| REQ-002 | Pulsante audio-guida per luogo dalla mappa | 1.1, 1.3 | `place-detail-drawer.component.ts` |
| REQ-003 | Download di testi/immagini per uso offline | 3.1, 3.2 | `offline-content.service.ts`, UI pacchetti, service worker |
| REQ-004 | Esportazione PDF e PNG | 3.3, 3.4 | `content-export.service.ts`, test browser |
| REQ-005 | Backend per aggiornamenti amministrativi | 2.1, 2.2, 2.3 | API, database, autenticazione e audit |
| REQ-006 | CMS e separazione contenuti/media | 2.1, 2.2, 2.4 | CMS, API, object storage, migrazione JSON |
| REQ-007 | Workflow approvazione e verifica | 2.2, 2.3 | stati editoriali, audit, rollback e policy pubblicazione |
| REQ-008 | RAG su fonti approvate e citazioni | 4.1, 4.2 | pipeline RAG, fonti versionate e citazioni UI |
| REQ-009 | Confidenza e astensione del chatbot | 4.3 | policy di retrieval/astensione e test |
| REQ-010 | Moderazione e registrazione domande | 4.4 | moderazione e controlli privacy/retention |
| REQ-011 | Supporto vocale chatbot | 4.5 | input/output vocale e gestione permessi |

## Decisioni rimandate

- CMS, framework backend, hosting e database: differiti per decisione utente del 2026-11-27.
- Voce audio definitiva: per la Fase 1 si usa la voce del dispositivo; registrazioni/TTS revisionato e download audio saranno scelti insieme alla gestione media.
- Mappe offline: escluse finché non sono verificati fornitore, licenza e limiti di caching.
- RAG, moderazione e logging chatbot: differiti; nessuna conversazione viene registrata.
