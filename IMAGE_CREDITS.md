# Inventario iniziale di luoghi, immagini e fonti

Data di verifica: 4 novembre 2026

Ambito: record in `src/assets/data/places.json`, immagini in `src/assets/images` e schede in `src/assets/content/places`.

Questo inventario registra ciò che è presente nel repository; non certifica l’identità dei luoghi, l’autenticità delle fotografie o i diritti d’uso. Le classificazioni visive si basano soltanto sull’ispezione degli asset locali. Un nome file, un commit Git o l’aspetto di un’immagine non dimostrano autore, provenienza o licenza.

## Sintesi

- 15 record di luogo; 8 schede Markdown di dettaglio e 7 voci ancora da censire.
- Alla baseline, 8 record avevano `sourceStatus: "to-verify"` ma `isVerifiedContent: true`; il flag è stato poi allineato a `false` per tutti e 8.
- Alla baseline dell’inventario, due fotografie JPG erano assegnate a 8 luoghi (4 record per immagine); per la maggior parte degli usi l’immagine non documentava il luogo specifico indicato.
- Le 7 voci “da censire” condividono esattamente le coordinate `41.8429366, 14.5621116`; non sono coordinate verificate per i singoli luoghi.
- Per nessuna delle due fotografie è stata trovata nel repository una registrazione di URL della fonte, autore/titolare, licenza specifica o attribuzione. L’utente ha dichiarato che l’uso è autorizzato; i dettagli documentali restano mancanti.
- Le schede Markdown descrittive non contengono citazioni o bibliografie puntuali. README dichiara che le coordinate principali derivano da OpenStreetMap/Overpass, ma non riporta per ciascun record un riferimento OSM stabile e un’attribuzione completa.

## Inventario per luogo

La tabella registra le associazioni osservate all’inizio dell’audit; le sostituzioni successive sono elencate in fondo al documento.

| ID | Luogo | Immagine assegnata | Corrispondenza visiva preliminare | Fonte e diritti |
|---|---|---|---|---|
| `centro-storico` | Centro storico | `san-giovanni-lipioni-borgo.jpg` | PROBABILMENTE CORRETTA: mostra una veduta ampia del borgo; il punto preciso e la data non sono documentati. | NON VERIFICABILE |
| `piazza-largo-popolo` | Piazza Largo del Popolo | `san-giovanni-lipioni-borgo.jpg` | ERRATA come immagine specifica della piazza: la veduta non identifica la piazza. | NON VERIFICABILE |
| `mostra-valdese` | Mostra Permanente Esperienza Valdese | `san-giovanni-lipioni-panorama.jpg` | ERRATA come immagine specifica della mostra: mostra il borgo e la chiesa, non lo spazio espositivo. | NON VERIFICABILE |
| `chiesa-santa-maria` | Chiesa di Santa Maria delle Grazie | `san-giovanni-lipioni-panorama.jpg` | PROBABILMENTE CORRETTA: la chiesa è visibile nella veduta; identità, data e provenienza non sono documentate. | NON VERIFICABILE |
| `salita-della-chiesa` | Via Salita della Chiesa | `san-giovanni-lipioni-borgo.jpg` | ERRATA come immagine specifica della via: la veduta non mostra chiaramente la salita. | NON VERIFICABILE |
| `fontana-vecchia` | Fontana Vecchia | `san-giovanni-lipioni-borgo.jpg` | ERRATA come immagine specifica della fontana: la fontana non è identificabile nella veduta. | NON VERIFICABILE |
| `cappella-santa-liberata` | Cappella di Santa Liberata | `san-giovanni-lipioni-panorama.jpg` | ERRATA come immagine specifica della cappella: la cappella non è identificabile nella veduta. | NON VERIFICABILE |
| `quercia-lozzi` | Quercia di Lozzi | `san-giovanni-lipioni-panorama.jpg` | ERRATA come immagine specifica dell’albero: l’immagine non documenta la quercia. | NON VERIFICABILE |
| `edicola-votiva-da-censire` | Edicola votiva da censire | `piazza-memory.svg` | MANCANTE: illustrazione segnaposto, non fotografia del luogo. | Asset SVG locale; autore/licenza non registrati. |
| `belvedere-da-censire` | Belvedere da censire | `panorama.svg` | MANCANTE: illustrazione segnaposto, non fotografia del punto. | Asset SVG locale; autore/licenza non registrati. |
| `punto-panoramico-da-censire` | Punto panoramico da censire | `panorama.svg` | MANCANTE: illustrazione segnaposto, non fotografia del punto. | Asset SVG locale; autore/licenza non registrati. |
| `contrada-da-censire` | Contrada da censire | `tradizioni.svg` | MANCANTE: illustrazione segnaposto, non fotografia della contrada. | Asset SVG locale; autore/licenza non registrati. |
| `architettura-rurale-da-censire` | Architettura rurale da censire | `borgo-stone.svg` | MANCANTE: illustrazione segnaposto, non documentazione dell’edificio. | Asset SVG locale; autore/licenza non registrati. |
| `casolare-storico-da-censire` | Casolare storico da censire | `borgo-stone.svg` | MANCANTE: illustrazione segnaposto, non documentazione del casolare. | Asset SVG locale; autore/licenza non registrati. |
| `paesaggio-agricolo-da-censire` | Elemento del paesaggio agricolo da censire | `panorama.svg` | MANCANTE: illustrazione segnaposto, non fotografia del luogo. | Asset SVG locale; autore/licenza non registrati. |

## Asset fotografici

| File | Dimensioni e peso | Usi nel JSON all’inizio dell’audit | Autore, fonte, licenza e attribuzione | Azione |
|---|---:|---|---|---|
| `src/assets/images/san-giovanni-lipioni-borgo.jpg` | 2288 × 1712 px; 1.210.386 byte | Centro storico, piazza, salita, fontana | DICHIARATO dall’utente: uso autorizzato; fonte, licenza specifica e attribuzione non registrate. | Non più referenziata dai record dei luoghi per evitare associazioni non specifiche. |
| `src/assets/images/san-giovanni-lipioni-panorama.jpg` | 1524 × 1485 px; 491.970 byte | Mostra valdese, chiesa, cappella, quercia | DICHIARATO dall’utente: uso autorizzato; fonte, licenza specifica e attribuzione non registrate. | Non più referenziata dai record dei luoghi per evitare associazioni non specifiche. |

La cronologia Git mostra l’introduzione delle due fotografie nel commit `a49794f` del 25 luglio 2026. La cronologia non prova titolarità, consenso o licenza. È stata rilevata la presenza di metadati incorporati; i valori non sono stati estratti o riportati, perché potrebbero contenere dati personali.

## Altri asset grafici

- Segnaposto in uso: `borgo-stone.svg`, `panorama.svg`, `piazza-memory.svg`, `tradizioni.svg`.
- Asset presenti ma non referenziati nei record luoghi: `fontana.svg`, `scalinate.svg`.
- Gli SVG sono illustrazioni, non immagini documentarie. Anche per gli asset locali non è presente una registrazione esplicita di autore e licenza.

## Fonti e contenuti

- `README.md` dichiara che i luoghi principali usano nomi e coordinate ricavati da OpenStreetMap tramite Overpass e che i dati OSM sono sotto ODbL. Nel JSON non è stato trovato un collegamento diretto a una feature OSM per ogni record, quindi la derivazione individuale e l’attribuzione restano da verificare.
- Le otto schede Markdown (`centro-storico`, `piazza-largo-popolo`, `mostra-valdese`, `chiesa-santa-maria`, `salita-della-chiesa`, `fontana-vecchia`, `cappella-santa-liberata`, `quercia-lozzi`) presentano testi editoriali senza riferimenti puntuali a opere, autori, pagine o URL.
- In particolare, i riferimenti a fasi costruttive cinquecentesche/seicentesche della chiesa e a un’iscrizione/restauro del 1844 alla Fontana Vecchia non sono accompagnati da una fonte citata nel repository: trattarli come **DICHIARATI, NON VERIFICATI**, non come fatti accertati.
- Le note OSM non costituiscono fonte per le affermazioni storiche, architettoniche o di accessibilità.

## Problemi dati osservati

- Gli 8 record inizialmente incoerenti hanno ora `isVerifiedContent: false`, coerente con `sourceStatus: "to-verify"`. Le schede continuano a mostrare lo stato dichiarato in `sourceStatus`.
- Le 7 voci da censire sono concentrate sul medesimo punto cartografico. Finché non si raccolgono coordinate individuali, non sono punti geografici utilizzabili; il raggruppamento può inoltre nascondere marker.
- Tutti i 15 record hanno un testo alternativo italiano presente; la sua accuratezza descrittiva non è stata validata indipendentemente.
- L’esistenza del file immagine è stata verificata per tutti i riferimenti. Questo non prova che l’immagine sia pertinente o che il suo uso sia autorizzato.

## Prossime azioni raccomandate

1. Chiedere al titolare del progetto la provenienza e i diritti delle due fotografie; non dedurli dal repository.
2. Non mostrare le voci “da censire” come posizioni confermate: raccogliere coordinate o adottare una rappresentazione esplicitamente non geografica.
3. Aggiungere per ogni affermazione storica una fonte consultabile (autore, titolo, data, pagina/sezione e URL o collocazione archivistica); lasciare non verificati i contenuti privi di riscontro.

Nessuna immagine è stata scaricata, sostituita, modificata o pubblicata durante la redazione di questo inventario.

## Aggiornamenti successivi all’inventario

Il 4 novembre 2026 gli 8 record che puntavano alle due fotografie JPG sono stati aggiornati per usare illustrazioni segnaposto locali. Per gli 8 record gli alt text indicano ora esplicitamente che l’immagine è un segnaposto non documentario.

| ID | Immagine segnaposto assegnata |
|---|---|
| `centro-storico` | `borgo-stone.svg` |
| `piazza-largo-popolo` | `piazza-memory.svg` |
| `mostra-valdese` | `tradizioni.svg` |
| `chiesa-santa-maria` | `borgo-stone.svg` |
| `salita-della-chiesa` | `scalinate.svg` |
| `fontana-vecchia` | `fontana.svg` |
| `cappella-santa-liberata` | `borgo-stone.svg` |
| `quercia-lozzi` | `panorama.svg` |

Le due fotografie restano nel repository, ma non sono più selezionate dai record dei luoghi. Poiché si trovano ancora nella directory degli asset, possono restare raggiungibili direttamente negli output statici. L’utente ha dichiarato che l’uso è autorizzato; provenienza, licenza specifica e attribuzione non sono documentate nel repository.

Gli 8 record con `sourceStatus: "to-verify"` hanno inoltre `isVerifiedContent` impostato a `false`. I 7 record `research` erano già impostati a `false`; i record non sono quindi più marcati come verificati mentre le rispettive fonti restano da controllare.

La dichiarazione di autorizzazione è stata fornita dall’utente il 4 novembre 2026. Non sono stati aggiunti dettagli di autore, fonte o licenza che non siano stati forniti.
