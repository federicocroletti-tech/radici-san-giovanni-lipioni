# Controllo carosello Instagram - Radici San Giovanni Lipioni

Data controllo: 2026-10-15

## Esito generale

- PNG finali presenti: 7
- Formato: 1080 x 1350 px
- Rapporto: 4:5
- Pixel format verificato: RGB, `Format24bppRgb`
- Sfondo trasparente: assente
- Link sito usato: `radici-san-giovanni-lipioni.onrender.com`
- Nome progetto usato: `Radici San Giovanni Lipioni`
- Sottotitolo/footer usato: `Il paese, luogo per luogo`
- Dicitura vietata `Atlante di San Giovanni Lipioni`: assente
- Dicitura `official` / `ufficiale` / `archivio comunale`: assente nei sorgenti social
- Generazione: script isolato `source/generate-carousel.ps1`
- Preview complessiva: `preview/preview-grid.png`

## Materiali usati

- Logo: `source/assets/logo-radici-instagram.png`, copiato da `social/Designer (2).png`, 1254 x 1254 px.
- Fotografia slide 7: `src/assets/images/san-giovanni-lipioni-borgo.jpg`.
- Fotografia interna al logo e asset identitario: contenuta nel logo fornito in alta qualita.
- Palette: colori coerenti con `src/styles.scss` e con il logo, marrone terra, verde scuro, ocra, crema.
- Font: Aptos con fallback di sistema, coerente con il sito.

## Controllo per slide

| Slide | File | Dimensioni | Fotografia utilizzata | Logo utilizzato | Font | Criticita | Stato |
|---|---|---:|---|---|---|---|---|
| 1/7 | `output/01-presentazione.png` | 1080 x 1350 | Fotografia contenuta nel logo | `source/assets/logo-radici-instagram.png` | Aptos | Nessuna | Pronto |
| 2/7 | `output/02-cosa-e-radici.png` | 1080 x 1350 | Nessuna fotografia esterna | `source/assets/logo-radici-instagram.png` | Aptos | Nessuna | Pronto |
| 3/7 | `output/03-cosa-documenteremo.png` | 1080 x 1350 | Nessuna fotografia esterna | `source/assets/logo-radici-instagram.png` | Aptos | Nessuna | Pronto |
| 4/7 | `output/04-cosa-non-racconteremo.png` | 1080 x 1350 | Nessuna fotografia esterna | `source/assets/logo-radici-instagram.png` | Aptos | Nessuna | Pronto |
| 5/7 | `output/05-come-lavoreremo.png` | 1080 x 1350 | Nessuna fotografia esterna | `source/assets/logo-radici-instagram.png` | Aptos | Nessuna | Pronto |
| 6/7 | `output/06-segnalazioni-contributi.png` | 1080 x 1350 | Nessuna fotografia esterna | `source/assets/logo-radici-instagram.png` | Aptos | Nessuna | Pronto |
| 7/7 | `output/07-da-dove-cominciamo.png` | 1080 x 1350 | `src/assets/images/san-giovanni-lipioni-borgo.jpg` | `source/assets/logo-radici-instagram.png` | Aptos | Nessuna | Pronto |

## Note

- I PNG sono file separati, non una tavola unica.
- La preview e solo aggiuntiva e non sostituisce i file separati in `output/`.
- Il generatore resta isolato in `source/` e non e integrato nel sito Angular.
- I sorgenti del carosello includono il collegamento al sito pubblico; rigenerare i PNG se serve aggiornare anche le immagini esportate.
- Non sono state modificate route, componenti o funzionalita produttive dell'applicativo.