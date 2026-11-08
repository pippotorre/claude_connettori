# Progetto: Guida Claude (PWA) + artefatto "Le mie skill di Claude"

Guida tascabile installabile (PWA) su skill, connettori, novità e suggerimenti, pubblicata da github.com/pippotorre/claude_connettori. L'artefatto "Le mie skill di Claude" resta come versione web consultabile da claude.ai.

## Obiettivo
- Elenco delle skill installate, con descrizione in italiano e ambito d'uso
- Elenco dei connettori (collegati dall'utente e integrati), con stato e ambito d'uso
- Novità Anthropic su skill, plugin e funzioni
- Suggerimenti basati su ciò che l'utente fa con Claude

## Decisioni
- **Formato**: PWA statica (HTML/CSS/JS, nessun framework). Tutti i contenuti in `data.json`, unica fonte di verità.
- **Hosting**: GitHub Pages dal ramo `main` (o qualsiasi server HTTPS).
- **Offline**: service worker con app in cache e `data.json` in stale-while-revalidate.
- **Connettori**: selezione di circa 120 connettori del catalogo in 14 categorie, più i 5 integrati. Il catalogo completo (centinaia di voci) si consulta solo per parole chiave, quindi un censimento totale non è praticabile.
- **Frequenza**: controllo settimanale (l'utente non aveva preferenze).
- **Notifiche**: solo push, e solo quando c'è una novità.
- **Suggerimenti**: la memoria di Claude non è attiva, quindi le sessioni programmate non sanno cosa fa l'utente. Per ora i suggerimenti si basano su connettori e plugin installati e sul profilo d'uso qui sotto.

## Profilo d'uso (da aggiornare)
- Connettori: Gmail, Google Calendar, Google Drive, MCP & Skills Finder (attivi); Google Docs (collegato, non attivo in chat)
- Plugin installati: Elastic
- Interessi emersi: capire come funzionano skill, connettori, plugin e comandi slash

## Registro sviluppo
- **2026-11-08**: prima versione. 49 skill in 6 categorie (26 del plugin Elastic), 2 novità, 4 suggerimenti. Creato questo file.
- **2026-11-08**: aggiunta la scheda "Connettori": 5 collegati dall'utente e 5 integrati. Estesa l'attività settimanale ai connettori.
- **2026-11-08**: creata la PWA nel repo `pippotorre/claude_connettori`: 5 sezioni (Skill, Connettori, Novità, Per te, Guida), 127 connettori, funzionamento offline, icone e manifest. L'attività settimanale ora aggiorna `data.json` nel repo.
