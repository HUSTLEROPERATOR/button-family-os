# RUNBOOK — Export read-only della baseline Button

Procedura ripetibile per esportare la versione live dell'app senza modificare nulla.

## Prima di ogni esecuzione

1. Verificare branch e working tree:

   ```powershell
   git branch --show-current   # atteso: audit/button-baseline-recovery
   git status --short          # nessuna modifica inattesa
   ```

2. Verificare che lo script contenga **solo GET** (review obbligatoria dopo ogni
   modifica allo script):

   ```powershell
   Select-String -Path .\audit\button-baseline-recovery\scripts\export-button-live-readonly.ps1 `
     -Pattern 'Invoke-WebRequest|Invoke-RestMethod|-Method'
   # atteso: una sola chiamata, con -Method Get
   ```

## Dry run (default, nessuna rete)

```powershell
.\audit\button-baseline-recovery\scripts\export-button-live-readonly.ps1
```

Mostra endpoint sanitizzato, metodo GET, destinazione e conferma di zero scritture
remote. Non esegue alcuna richiesta.

## Esecuzione reale (read-only)

```powershell
.\audit\button-baseline-recovery\scripts\export-button-live-readonly.ps1 -ExecuteReadOnly
```

Esiti:

| Exit code | Significato | Azione |
|---|---|---|
| 0 | Export riuscito: file + manifest sotto `exports/<timestamp>/` | verificare hash |
| 2 | Numero record ≠ 1 o `content` vuoto (`ANOMALY.md` creato) | stop, verifica manuale dalla dashboard autorizzata |
| 3 | HTTP non-2xx o errore di rete (`BLOCKER.md` creato) | stop, aggiornare `05_ACCESS_AND_BLOCKERS.md`; nessun bypass |
| 4 | Estrazione URL/chiave fallita o guardia di sicurezza | stop, verificare `index.html` |

## Dopo l'esecuzione

1. Registrare SHA-256, dimensione e timestamp in `03_LIVE_SOURCE_MANIFEST.md`.
2. Confrontare l'hash con l'export precedente:
   - **uguale** → la produzione è invariata (requisito M0);
   - **diverso** → la versione live è cambiata: registrare la nuova baseline e
     annotare la variazione (non è un errore, ma va tracciato).
3. Verificare che Git non tracci nulla di `exports/`:

   ```powershell
   git status --short   # exports/ non deve comparire (solo .gitignore è tracciato)
   ```

## Divieti permanenti

- Non aprire `button-live-app.html` nel browser (il load esegue chiamate al DB di
  produzione, incluse DELETE di retention — vedi `03_LIVE_SOURCE_MANIFEST.md` §rischi).
- Non aggiungere gli export a Git; non copiarli fuori dalla cartella `exports/`.
- Non usare chiavi diverse da quella publishable già pubblica nel loader.
- Non modificare lo script per aggiungere metodi diversi da GET.
- In caso di 401/403: fermarsi e documentare; nessun tentativo di bypass.

## Baseline registrate

| Data (UTC) | Run | SHA-256 | Byte | Esito |
|---|---|---|---|---|
| 2026-07-25 | `20260725-025330Z` | `16DA604373877C94FDDF0C6A4BCAF64758774ED9C55B1C57B1EADA4C747ACEDC` | 192.478 | OK — 1 record |
