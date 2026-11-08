# Guida Claude — skill e connettori

PWA tascabile in italiano con:
- **Skill** installate, con descrizione e ambito d'uso
- **Connettori**: i tuoi (collegati e integrati) e una selezione del catalogo per categoria
- **Novità** Anthropic
- **Per te**: suggerimenti personalizzati
- **Guida**: i concetti base (skill, connettori, plugin, comandi slash…)

Funziona offline e si installa sul telefono.

## Struttura
| File | Ruolo |
|---|---|
| `index.html`, `style.css`, `app.js` | interfaccia |
| `data.json` | **tutti i contenuti** (l'unico file che cambia di solito) |
| `sw.js` | service worker: app in cache, `data.json` aggiornato in background |
| `manifest.webmanifest`, `icons/` | installazione come app |
| `progetto.md` | decisioni e registro dello sviluppo |

## Pubblicazione
**GitHub Pages**: Settings → Pages → *Deploy from a branch* → `main` / root. L'indirizzo sarà `https://pippotorre.github.io/claude_connettori/`.

**Server proprio**: copia tutti i file in una cartella servita in HTTPS (obbligatorio per il service worker). Tutti i percorsi sono relativi, quindi funziona anche in una sottocartella. Consigliato servire `sw.js` e `data.json` con `Cache-Control: no-cache`.

## Installazione sul telefono
- **Android (Chrome)**: apri l'indirizzo → pulsante *Installa* in alto oppure menu ⋮ → *Installa app*.
- **iPhone (Safari)**: apri l'indirizzo → *Condividi* → *Aggiungi alla schermata Home*.

## Aggiornamenti
Un'attività programmata di Claude aggiorna `data.json` ogni lunedì. L'app mostra subito la versione in cache e scarica quella nuova in background, avvisando con "Contenuti aggiornati". Se cambiano i file dell'interfaccia, incrementa `VERSION` in `sw.js`: l'app proporrà "Nuova versione disponibile → Aggiorna".
