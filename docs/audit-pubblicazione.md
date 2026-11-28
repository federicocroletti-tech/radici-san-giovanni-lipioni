# Audit editoriale e gate di pubblicazione

**Progetto:** Radici San Giovanni Lipioni
**Data dell'audit:** 28 novembre 2026
**Esito:** **pubblicazione non approvata**. I dati applicativi non sono stati modificati per correggere o promuovere affermazioni storiche, coordinate o racconti. Questo documento propone verifiche da svolgere e registra i blocchi di rilascio rilevati. La validazione automatica controlla la presenza della documentazione, non certifica la verita delle affermazioni né sostituisce revisione legale o sopralluogo.

### Marcatori individuati nei file richiesti

- `places.json`: 15 `sourceNotes`; 8 schede `to-verify` con coordinate `osm-unverified`, 7 schede `research` senza coordinate; tutte hanno `isVerifiedContent: false`.
- `timeline.json`: 2 affermazioni `to-verify`. `itineraries.json`: 3 percorsi `unverified`.
- `stories.json`: 3 contenuti `isMock: true`, ognuno con `consentRequiredNotice`; nessuno contiene evidenza di consenso, perche sono testi dimostrativi.
- `chatbot-knowledge.json`: descrive la guida e i racconti come demo e dice che le testimonianze reali richiedono consenso; questo disclaimer non dimostra l'autorizzazione di un contenuto.
- `src/assets/i18n/it.json`, `en.json`, `fr.json`: label e messaggi per `to-verify`, `research`, `unverified`, `demoNotice`, `mockNotice`, note fonti e consenso; privacy/cookie sono dichiarati demo/modello. I testi di interfaccia non sostituiscono le evidenze sui singoli record.
- `docs/san-giovanni-lipioni/pubblico/`: note storiche, archeologiche, culturali, naturalistiche e istituzionali contengono fonti secondarie, snippet e ipotesi dichiarate; la cartella `pubblico` non equivale a verifica editoriale o licenza di riproduzione.
- `README.md`: definisce l'app demo, tre itinerari mock, racconti demo, coordinate OSM non verificate e informativa privacy da revisione. `public/` non contiene testi editoriali con quei marcatori, ma include 10 immagini statiche che devono essere sottoposte al gate diritti.

## 1. Inventario delle verifiche sul campo

`places.json` contiene 15 schede: 8 con coordinate OpenStreetMap dichiarate ma `osm-unverified`, stato editoriale `to-verify` e `isVerifiedContent: false`; 7 segnaposto `research` senza coordinate. Nessuna scheda ha stato `field-verified`. Le coordinate seguenti sono riferimenti da controllare, non indicazioni certificate.

| ID e luogo | Coordinate presenti (latitudine, longitudine) | Stato e verifica necessaria |
|---|---|---|
| `centro-storico` — Centro storico | 41.8429366, 14.5621116 | Verificare che il punto rappresenti il perimetro/centro scelto, non una singola attrazione; rilevare accessi, pendenze, pavimentazione e panorama. |
| `piazza-largo-popolo` — Piazza Largo del Popolo | 41.8440329, 14.5617977 | Confermare nome locale, posizione esatta, accesso pubblico e condizioni d'uso. |
| `mostra-valdese` — Mostra Permanente Esperienza Valdese | 41.8440321, 14.5615785 | Confermare sede e denominazione con gestore; verificare apertura, contatti, accesso e contenuti esposti. |
| `chiesa-santa-maria` — Chiesa di Santa Maria delle Grazie | 41.8430544, 14.5619544 | Confermare ingresso e punto mappa; verificare accessibilita, culto/orari solo con fonte ufficiale e permesso per foto interne. |
| `salita-della-chiesa` — Via Salita della Chiesa | 41.8434745, 14.5617107 | Rilevare il tracciato, non un singolo punto; misurare pendenza, gradini, fondo e alternative accessibili. |
| `fontana-vecchia` — Fontana Vecchia | 41.8477431, 14.5626981 | Confermare identita, accesso e sicurezza; non presentare iscrizioni o date di restauro come accertate. |
| `cappella-santa-liberata` — Cappella di Santa Liberata Vergine e Martire | 41.8471971, 14.5604140 | Confermare denominazione, proprieta/accesso, percorso, accessibilita e condizioni di apertura. |
| `quercia-lozzi` — Quercia di Lozzi | 41.8492813, 14.5585058 | Verificare che il punto identifichi l'albero/gruppo corretto, accesso e proprieta; confermare specie, circonferenza e tutela con fonte competente. |
| `edicola-votiva-da-censire` | Nessuna | Non e un luogo localizzato; censire solo dopo identificazione e autorizzazioni. |
| `belvedere-da-censire` | Nessuna | Non e un belvedere identificato; definire punto, orientamento della vista e proprieta/accesso. |
| `punto-panoramico-da-censire` | Nessuna | Individuare e verificare sul posto, inclusi parapetti, rischio e accessibilita. |
| `contrada-da-censire` | Nessuna | Verificare toponimo e confini con cartografia e fonte locale autorevole; non inventare un punto. |
| `architettura-rurale-da-censire` | Nessuna | Individuare bene e proprieta; pubblicare solo descrizioni non identificanti o autorizzate. |
| `casolare-storico-da-censire` | Nessuna | Nessuna localizzazione; non geolocalizzare proprieta private o abitazioni senza valutazione e permesso. |
| `paesaggio-agricolo-da-censire` | Nessuna | Definire elemento e perimetro solo con rilievo, fonte e valutazione dei dati di proprieta. |

### Checklist coordinate, percorsi e accessibilita

- [ ] Registrare per ogni coordinate point il metodo, fonte/codice del verbale di rilievo, data, verificatore e precisione; confermare WGS84 e che non sia un indirizzo privato.
- [ ] Verificare il punto sul posto e l'oggetto nominato; mantenere separata la provenienza OSM dal sopralluogo. Non impostare `field-verified` senza evidenza.
- [ ] Percorrere per intero il tracciato di ogni itinerario, registrando inizio/fine, tappe, distanza misurata, durata osservata, dislivello, fondo, gradini, attraversamenti e deviazioni.
- [ ] Verificare accesso pubblico, proprieta/permessi, chiusure, lavori, rischi, copertura mobile, punti di sosta, acqua/servizi e stagionalita; riportare la data di validita e chi contattare per aggiornamenti.
- [ ] Descrivere in modo osservabile l'accessibilita: barriere, larghezze, pendenze, pavimentazione, scale, sedute e alternativa senza gradini. Non usare etichette generiche come "accessibile" senza criteri.
- [ ] Validare la navigazione anche senza mappa e con tecnologie assistive; coordinare le indicazioni digitali con quelle sul posto.
- [ ] Ricontrollare le condizioni prima della pubblicazione e definire una frequenza di revisione (almeno a ogni stagione e dopo segnalazioni).

I tre itinerari sono tutti `unverified`; i relativi passaggi sono:

| ID percorso | Tappe dichiarate da verificare |
|---|---|
| `cuore-del-borgo` | Centro storico, piazza, mostra valdese, chiesa |
| `scalinate-centro` | Centro storico, Salita della Chiesa, chiesa, piazza |
| `santa-liberata-fontana` | Fontana Vecchia, Cappella di Santa Liberata, Quercia di Lozzi |

Nel dataset dei luoghi non risultano orari, giorni di apertura, servizi, recapiti o date di ultimo controllo. Non inferire che un luogo sia aperto o visitabile. Per mostra, chiesa, cappella e aree private, chiedere conferma al gestore/proprietario e indicare fonte e data di aggiornamento; altrimenti omettere l'informazione pratica.

## 2. Registro delle affermazioni storiche e culturali

Nel registro macchina `sources.json` sono presenti quattro schede, tutte riferite alla chiesa o alla Fontana Vecchia. Una citazione registrata prova che una fonte e stata consultata, non che la tesi sia vera. Ogni affermazione seguente resta da verificare prima di essere presentata come fatto.

| Affermazioni da verificare | Evidenza gia presente nel repository | Fonti/evidenze necessarie e criterio di approvazione |
|---|---|---|
| Denominazioni e coordinate OSM dei luoghi; il README dichiara estrazione via Overpass e licenza ODbL. | Gli 8 punti localizzati sono tutti `osm-unverified`; le schede non riportano un riferimento stabile alla singola feature OSM. OSM non prova accessibilita, orari o storia. | Registrare ID e URL della feature, data/query Overpass, attribuzione ODbL e modifiche al dato; verificare il punto sul posto prima di `field-verified`. Separare sempre origine cartografica e rilievo sul campo. |
| Datazione della chiesa: XVI secolo, XVII secolo o costruzione nel 1504; facciata, elementi in pietra, navata unica e rinnovo tra XVIII-XIX secolo. | `sources.json`: Diocesi di Trivento (`diocesi-trivento-san-giovanni-lipioni`, XVII sec.); AltoVastese 2010 (`altovastese-santa-maria-delle-grazie-2010`, XVI sec. e descrizione secondaria); BeWeB-CEI (`beweb-cei-santa-maria-delle-grazie`, denominazione/parrocchia); Wikipedia (`wikipedia-it-san-giovanni-lipioni`, 1504, fonte secondaria). Tesi discordanti. | Consultare direttamente Furlani 1993 e 1998-99, Picciani 1995 e registri/archivi ecclesiastici o catalogo MiC; sopralluogo architettonico. Citare autore, titolo, edizione, pagina/scheda, data e quale tesi supporta. Non scegliere una data senza risolvere la discordanza. |
| Fontana Vecchia: restauri 1808, 1821, 1832, 1844 e iscrizione/riassetto. | Wikipedia in italiano, riportata in `sources.json`; le descrizioni `places.json` segnalano che la fonte non e stata verificata. | Verificare iscrizione con trascrizione/foto autorizzata, atti comunali, archivio o pubblicazione specialistica. Se una data resta attribuita solo a Wikipedia, pubblicarla solo come attribuzione esplicita o ometterla. |
| Origini del borgo, ipotesi Terventum, Tavola osca/tempio, presenza italica, bronzi, tombe sannite e provenienza della cosiddetta testa "Gavio Ponzio". | `docs/.../archeologia/ritrovamenti-italici.md`: record BnF Bronze.857; statuetta circa 14 cm senza scheda online; tombe da snippet non accessibile; Tavola osca basata su Grokipedia. `docs/.../storia/storia-generale.md` dichiara incerte le origini. | Usare catalogo BnF direttamente per il bronzo; identificare inventario e catalogo del secondo reperto; consultare pubblicazioni archeologiche e cataloghi istituzionali per tombe e Tavola osca. Escludere Grokipedia/snippet come unica prova. Separare fatto documentato da ipotesi. |
| Cronologia e toponimi: *Sanctus Johannes a podio Bacco*, *San Giovanni Lupino*, "Lipioni" da *los peones*, impianto a pettine medievale e dipendenza feudale. | Wikipedia, Wikiwand e bibliografia locale sono riferimenti secondari; alcuni passaggi sono marcati nel documento come ipotesi/non verificati. | Consultare documenti d'archivio, cartografia storica, Facco 2019 e Picciani 1995 direttamente. Registrare le varianti con data e fonte, senza presentare etimologie ipotetiche come certezze. |
| Festa del Majo (*Lu Maje*): date 30 aprile/1 maggio, raccolta dei ciclamini, croce fiorita, messa/processione/canti e origine preistorica o cristianizzata. | `docs/.../tradizioni-cultura/feste-e-tradizioni.md`: Festival in Italia, Wikipedia, materiale citato di riviste/video non consultati. L'origine e qualificata divulgativa/non accademica. | Intervistare Pro Loco/parrocchia e piu testimoni con consenso; verificare programma e svolgimento dell'anno corrente; consultare riviste e archivio audiovisivo con diritti. Distinguere tradizione orale, descrizione contemporanea e interpretazione accademica dell'origine. |
| Spallata: danza nuziale, legame propiziatorio, sequenza quadriglia, numero di danzatori, attestazioni ottocentesche e ipotesi seicentesca. | `docs/.../tradizioni-cultura/feste-e-tradizioni.md`: pagina Visit San Giovanni Lipioni non raggiungibile in questa sessione e sito spallate.it citato da fonte locale. | Consultare le fonti originali citate, archivi audiovisivi e studiosi/portatori della tradizione. Registrare data, contesto e varianti; non generalizzare una singola esecuzione. |
| Patrono San Felice, festa 20-21 agosto con Sant'Antonio oppure 2 luglio. | `docs/.../santo-patrono/san-felice.md`: conflitto tra Wikipedia e Santo del giorno; chiesa indicata tra XVI secolo e 1504 da fonti secondarie. | Conferma scritta di parrocchia/comune e calendario liturgico locale; conservare la discordanza finche non risolta. Non indicare data certa nel prodotto prima della conferma. |
| Storia della comunita valdese e contenuti della Mostra Permanente Esperienza Valdese. | `docs/.../tradizioni-cultura/feste-e-tradizioni.md` cita Franco Monaco (2008), un video Rai e il sito della mostra; scheda del luogo dice che materiali e contenuti sono da verificare. | Consultare il libro senza riprodurne testo protetto; chiedere al gestore scheda, date, oggetti e diritti delle immagini/esposizioni. Distinguere la storia locale documentata dalla descrizione del percorso espositivo attuale. |
| Territorio, fiume Trigno, distanza dal mare, Natura 2000, Important Bird Area, specie, albero monumentale e circonferenza 5,05 m. | `docs/.../natura-ambiente/territorio.md` riporta snippet di sito locale e libro Nasini 2012 non consultato; non vi e una scheda locale completa per la quercia. | Usare cartografia e atti ufficiali UE/Regione/ISPRA per aree e specie; consultare Nasini e censimento regionale degli alberi monumentali; misurare sul posto con metodo e data. Non pubblicare coordinate precise di specie/habitat sensibili se possono arrecare danno. |
| Popolazione, altitudine/superficie, dialetto *San Giuann*, etnonimo sangiovannesi e andamento storico dei residenti. | `docs/.../storia/storia-generale.md` e `istituzioni-comune/fonti-istituzionali.md` includono dati Wikipedia/Tuttitalia e una rilevazione indicata al 31 maggio 2026. | Sostituire aggregatori con dataset ISTAT/Comune; registrare anno di riferimento, unità e metodo. Per dialetto/etnonimo consultare opere linguistiche e parlanti locali con consenso, specificando varianti. |
| Dati istituzionali aggiornabili: sindaco, uffici, telefono/email, indirizzo, statuto e licenze dei cataloghi. | `docs/.../istituzioni-comune/comune.md` e `fonti-istituzionali.md`; alcune informazioni sono riprese da Wikipedia o da portali terzi. | Conferma sulle pagine ufficiali alla data di pubblicazione; controllare licenza/attribuzione del catalogo. Non confondere contatti dell'ente con contatti del titolare del progetto. |
| Racconti, memorie, leggende e testimonianze reali. | `stories.json` contiene 3 record con `isMock: true` e `consentRequiredNotice`; `docs/.../favole-leggende/README.md` dichiara che non sono stati trovati testi locali verificabili. | I mock non sono testimonianze. Per ogni storia reale: fonte/intervistato, consenso e perimetro d'uso documentati fuori dal repository, revisione dell'interessato ove possibile, anonimizzazione e verifica dei fatti prima della pubblicazione. |

Per ogni singola affermazione inserire una voce in `sources.json` con identificativo stabile, titolo, autore/ente, editore, citazione, URL o collocazione archivistica, data di consultazione, pagine/sezioni e claim supportati. Le fonti secondarie, i risultati di ricerca, gli snippet e le tradizioni orali devono essere etichettati come tali. Il registro attuale non copre la maggior parte delle affermazioni elencate.

## 3. Inventario immagini e autorizzazioni

L'inventario macchina `src/assets/data/image-assets.json` ora comprende **21 file**: 11 in `src/assets/images` e 10 immagini pubblicate da `public`. Solo 2 hanno stato `rights-documented`; 19 restano bloccanti. La presenza di un file, un nome, un commit o una dichiarazione generica di autorizzazione non dimostrano titolarita/licenza. La build include anche icone e favicon, non solo immagini delle schede.

| File o gruppo | Uso/stato nel progetto | Prova/azione richiesta |
|---|---|---|
| `src/assets/images/commons-san-giovanni-lipioni-panorama.jpg` | Fotografia generale assegnata al Centro storico; inventario dichiara autore Bluholmes82 e CC BY-SA 3.0. | Verificare pagina sorgente, licenza vigente, attribuzione e rispetto ShareAlike per eventuali adattamenti; non usarla come prova fotografica di singoli monumenti. |
| `src/assets/images/commons-san-giovanni-lipioni-via-fontana.jpg` | Fotografia generale non assegnata a una scheda; inventario dichiara Benghazi69 e CC BY 4.0. | Verificare pagina/licenza/attribuzione e decidere se mantenerla nel pacchetto pubblico; non e una foto documentaria della Fontana Vecchia. |
| `src/assets/images/borgo-stone.svg`, `chiesa-placeholder.svg`, `fontana.svg`, `panorama.svg`, `piazza-memory.svg`, `scalinate.svg`, `tradizioni.svg` | 7 illustrazioni segnaposto; alcune associate alle schede, nessuna documenta il bene reale. Inventario `rights-unverified`. | Confermare autore e provenienza dei sorgenti, licenza e attribuzione; se creati per il progetto, registrare autore, data e titolarita. Mantenerle chiaramente come illustrazioni, non fotografie. |
| `src/assets/images/san-giovanni-lipioni-borgo.jpg`, `san-giovanni-lipioni-panorama.jpg` | 2 fotografie non assegnate; l'inventario riporta una dichiarazione d'uso autorizzato del 4 novembre 2026, ma autore, fonte, licenza specifica e attribuzione sono nulli. | Ottenere conferma scritta dal titolare, fonte originale, autore, diritti/licenza, usi consentiti e attribuzione; controllare metadati incorporati per dati personali prima della distribuzione. Altrimenti escluderle dal pacchetto statico. |
| `public/branding/logo-radici.jpg`, `public/favicon.ico`, `public/icons/icon-72x72.png`, `icon-96x96.png`, `icon-128x128.png`, `icon-144x144.png`, `icon-152x152.png`, `icon-192x192.png`, `icon-384x384.png`, `icon-512x512.png` | 10 asset di marchio/PWA generati/derivati secondo README; tutti registrati `rights-unverified`. | Ricostruire la catena dal sorgente social al file pubblicato; attestare autore, titolarita, elementi di terzi e licenza. Verificare separatamente il diritto sul marchio e le autorizzazioni di eventuali persone ritratte. |

Correzione di conteggio per chiarezza: il gruppo icone e formato dai file con dimensioni 72, 96, 128, 144, 152, 192, 384 e 512 px (8 file); insieme a favicon e logo sono 10 file pubblici. I file social di origine e le creativita Instagram non sono inclusi nella build del sito da questa scansione, ma richiedono un registro diritti separato prima di un loro uso pubblico.

Per ogni immagine documentare, prima dell'uso: identificativo/file, autore/titolare, URL o fonte primaria, licenza/versione e link ai termini, testo di attribuzione esatto, eventuale modifica, prova/permesso e ambito (web, app, offline, stampa/social), data e responsabile che ha verificato. Per fotografie di persone o proprieta private, aggiungere liberatoria mirata; non conservare liberatorie o dati identificativi nel repository pubblico.

## 4. Stati editoriali e modifiche necessarie

| Stato | Significato | Condizione per passare allo stato successivo |
|---|---|---|
| `research` | Ipotesi/idea non ancora identificata o sostenuta da fonti sufficienti. Non e un fatto e non va presentata come luogo verificato. | Individuazione certa, fonte consultabile e autorizzazioni/coordinate applicabili. |
| `to-verify` | Informazione/luogo identificato in via preliminare, ma manca almeno una verifica editoriale, documentale o sul campo. Deve essere qualificato come non verificato se resta visibile in una demo. | Evidenze citate per ogni claim; sopralluogo per coordinate e caratteristiche pratiche; revisione indipendente. |
| `verified` | Specifico claim confrontato con fonti registrate e approvato da un revisore. Non significa che ogni dato pratico o immagine collegata sia automaticamente verificato. | Approvazione editoriale tracciata e verifica separata di coordinate, accessibilita, orari e diritti immagine. |
| `published` / `field-verified` | Approvazione editoriale o rilievo sul posto completo, datato e citabile. | Riesame programmato e procedura di correzione/revoca. |

Modifiche richieste, non ancora applicate ai contenuti storici:

1. Conservare `sourceStatus`, `coordinateStatus` e `verificationStatus` come stati indipendenti; non impostare `verified` per il solo fatto che esista una fonte o una coordinata OSM.
2. Esporre un badge leggibile e comprensibile per `research`, `to-verify` e `verified` su schede, cronologia, chatbot, esportazioni PDF e contenuti offline. Nessun fallback UI deve far apparire un claim non documentato come certo.
3. Tenere `isVerifiedContent: false` finche il claim non supera revisione e le fonti sostengono proprio quel claim; registrare eventuale dissenso e versioni delle fonti.
4. Non mostrare i 7 segnaposto `research` come attrazioni mappate o visitabili; rimuoverli solo dopo approvazione editoriale, non cancellando la traccia di audit.
5. Non presentare gli itinerari come percorsi consigliati/percorribili fino a verifica sul campo, incluso lo stato accessibilita. Dichiarare data e condizioni.
6. Non usare `consentRequiredNotice` come prova di consenso. Mantenere i tre testi con `isMock: true` esplicitamente marcati demo o escluderli dal profilo di pubblicazione.
7. Mantenere separati i diritti dell'immagine, la verita del testo, la posizione del luogo e l'approvazione editoriale. L'attribuzione dell'immagine non convalida i claim storici.
8. Aggiornare le traduzioni IT/EN/FR insieme alle modifiche approvate; non tradurre un claim incerto in un'affermazione piu categorica.

Il nuovo comando `npm run validate:publication-ready` controlla queste condizioni sui dati strutturati e su ogni immagine in `src/assets/images` e `public`. E un blocco preventivo, non una certificazione: non legge/verifica autonomamente le fonti online, non accerta l'autenticita delle liberatorie e non controlla il contenuto semantico di ogni frase UI o documento.

## 5. Checklist privacy, cookie, dati personali e consenso

- [ ] Identificare titolare del trattamento, finalita, basi giuridiche, contatto privacy, sede, conservazione, diritti e procedura per richieste; il testo attuale ha titolare/contatto/sede da verificare e dichiara di essere un modello da validare legalmente.
- [ ] Far verificare l'informativa e il banner da un professionista privacy rispetto al sito effettivamente distribuito, inclusi Render, log server, CDN, hosting, Leaflet/OpenStreetMap, eventuali link Google Maps e strumenti di telemetria.
- [ ] Inventariare cookie, localStorage, service worker/Cache Storage, analytics/marketing e richieste di terze parti per sito e app mobile. Le traduzioni dichiarano analytics mock, categorie opzionali disattivate e tile OSM esterne: verificare tali affermazioni sull'output di produzione.
- [ ] Verificare che il consenso sia granulare, libero, informato, revocabile e registrato solo quanto necessario; nessuna categoria non necessaria prima della scelta. Verificare durata, reset, rifiuto, accessibilita del banner e comportamento senza JavaScript/rete.
- [ ] Controllare il contatto email personale riportato in `PUBLISHING_DATA.md`: confermare che sia intenzionalmente pubblico e predisporre, se opportuno, un recapito di progetto. Non copiare indirizzi personali nel frontend senza decisione esplicita.
- [ ] Esaminare nomi, contatti, documenti d'archivio, genealogie e immagini in tutti gli asset, PDF e contenuti offline. La cartella `docs/.../privato/` dichiara l'assenza di file in questa fase: mantenerla fuori da bundle e pubblicazione.
- [ ] Non pubblicare atti di stato civile nominativi recenti, dati di persone viventi, indirizzi di abitazioni private o informazioni sensibili senza base giuridica, minimizzazione e autorizzazione appropriata.
- [ ] Per interviste/testimonianze reali raccogliere consenso esplicito, specifico e documentabile prima di registrare o pubblicare; chiarire testo/audio/foto, nome o anonimato, web/app/stampa, traduzioni, conservazione, revoca e contatto. Per minori o persone vulnerabili richiedere revisione dedicata e le autorizzazioni necessarie.
- [ ] Conservare le liberatorie in archivio ad accesso limitato, fuori dal repository e dai log; nel dataset inserire solo un riferimento non identificativo alla prova, data, ambito e stato.
- [ ] Rimuovere metadati EXIF non necessari da fotografie; non incorporare coordinate, nomi o dati di dispositivi senza ragione e autorizzazione.
- [ ] Verificare i testi e le immagini dei PDF scaricabili/offline, la retention delle cache e la possibilita di cancellare contenuti; fornire contatto per correzioni e richieste di rimozione.
- [ ] Controllare attribuzioni e licenze di Wikimedia/ODbL e opere testuali protette; citazione e riassunto non autorizzano la riproduzione integrale.

## 6. Piano operativo e approvazioni

Le date sono scadenze proposte a partire dall'audit del 28 novembre 2026. Sostituire i ruoli con responsabili nominati solo dopo l'accettazione del progetto.

| Scadenza proposta | Responsabile | Attivita | Criterio di approvazione |
|---|---|---|---|
| 2 dicembre 2026 | Project manager/editor responsabile | Nominare revisore editoriale, rilevatore locale, referente immagini, referente privacy e release owner; congelare i claim e distribuire le schede di verifica. | Ogni claim/luogo/immagine ha un ID, owner, stato e prossima azione; dati non verificati restano immutati. |
| 9 dicembre 2026 | Rilevatore locale + referenti Comune/gestori | Sopralluogo degli 8 punti localizzati e dei 3 percorsi; conferma toponimi, accessi, sicurezza, accessibilita, distanze/durate; nessun orario senza fonte aggiornata. | Verbale datato per ciascun punto/percorso, evidenza consultabile e campi tecnici completi; eccezioni lasciate non verificate e non promosse. |
| 14 dicembre 2026 | Ricercatore/archivista + editor culturale | Verificare fonti primarie e secondarie per ogni affermazione del registro, risolvere o dichiarare le discordanze; integrare `sources.json` solo dopo consultazione effettiva. | Ogni claim pubblicato ha fonte specifica e riferimenti puntuali; revisore diverso dall'autore approva o rifiuta. |
| 16 dicembre 2026 | Titolare dei diritti + referente asset | Documentare logo, 8 icone/favicon, segnaposto e foto; escludere file senza catena dei diritti; controllare attribuzione, metadati e liberatorie. | Tutti i file effettivamente distribuibili sono inventariati e con diritti documentati; attribuzione visibile dove richiesta. |
| 16 dicembre 2026 | Consulente privacy + titolare del progetto | Validare informative, cookie, storage, terze parti, contatti, log e testi store/web; approvare processo per consenso e revoca delle testimonianze. | Parere/revisione tracciabile, informazioni complete e comportamento del sito coerente; nessuna testimonianza priva di evidenza. |
| 18 dicembre 2026 | Revisore accessibilita + redazione | Controllare schede, badge di stato, contrasto, tastiera/screen reader, percorsi e alternative testuali in IT/EN/FR; verificare esportazioni e mobile. | Problemi bloccanti risolti o esclusi dal rilascio; claim sulle condizioni accessibili supportati da rilievo recente. |
| 21 dicembre 2026 | Release owner + project manager | Rieseguire test, build, gate e revisione finale; autorizzare separatamente web, app mobile e social. | Gate automatico verde, approvazioni editoriali/diritti/privacy/accessibilita registrate, nessun dato non verificato presentato come certo e piano di aggiornamento operativo. |

## 7. Validazione automatica e risultati

Comandi introdotti:

- `npm run test:publication-readiness`: test del gate, inclusi casi che devono bloccare contenuti e immagini incompleti.
- `npm run validate:publication-ready`: controllo dei dati correnti e delle immagini effettivamente presenti nelle directory statiche.
- Render esegue `validate:publication-ready` prima dei test finali e della build: un esito negativo impedisce il deploy statico.

La build tecnica locale non equivale a un'autorizzazione di pubblicazione. Il gate attuale e previsto che fallisca finche restano record `to-verify`/`research`, itinerari `unverified`, racconti mock o diritti immagine incompleti. Il controllo automatico non sostituisce un controllo umano delle fonti, una revisione legale o la prova delle liberatorie.

### Risultati esecuzione

Esecuzione sul worktree del 28 novembre 2026:

| Controllo | Esito | Dettaglio |
|---|---|---|
| `npm run validate:places` | PASS | 15 luoghi (8 localizzati, 7 senza coordinate), 21 immagini inventariate, 4 fonti, 2 eventi cronologici e 3 itinerari strutturalmente validi. |
| `npm run test:place-validation` | PASS | 36 test di coordinate, luoghi, fonti, cronologia, itinerari e gate di pubblicazione. |
| `npm run validate:publication-ready` | BLOCCO ATTESO | Exit code 1, **86 rilievi**: 19 immagini senza diritti documentati, 15 luoghi non approvati, 3 itinerari non rilevati, 2 claim storici/culturali non verificati e 3 racconti mock. Render non puo distribuire il sito. |
| `npm run lint` | PASS | Tutti i file superano Angular lint. |
| `npm run build` | PASS | Bundle browser/server creati, 7 route prerenderizzate; restano warning CommonJS di dipendenze `canvg`/`jspdf`, non bloccanti. |
| `npm test` | PASS | Vitest: 17/17 test. |
| `npm run test:e2e` (configurazione finale: 1 worker) | PASS | Playwright: 17/17 test. Con 6 worker il test offline ha fallito per una richiesta SVG rimasta senza risposta entro il timeout; il test isolato e l'intera suite seriale sono passati. Il limite a un worker rende deterministico il comando standard. |
| `npm run test:production` | PASS | 1/1 test del server statico/produzione. |
| Runtime validation standalone | PASS | 12/12 asserzioni: installazione simulata, lint, validatori, unit test, audit dipendenze, build, E2E, server e probe HTTP. |

Il passaggio di build e test certifica soltanto il funzionamento tecnico. Il rilascio resta **bloccato** dal gate e dalle verifiche umane elencate sopra.
