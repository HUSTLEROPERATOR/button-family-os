# 02 — Source recovery plan (read-only)

Piano di recupero della baseline Button senza alcuna modifica alla produzione.
Copre AUD-002 (parziale, lato app), AUD-003 e AUD-004 dell'Execution Board.

## Principi

1. Si usa **solo** la GET pubblica già eseguita dal loader (`bfos_assets?key=eq.app&select=content`).
2. Nessun metodo diverso da GET; nessuna RPC; nessuna chiave diversa da quella già
   pubblica in `index.html`.
3. L'HTML recuperato non viene eseguito, non viene aperto nel browser, non entra in Git.
4. Ogni export produce hash SHA-256, dimensione, timestamp e manifest, per rendere la
   baseline identificabile e confrontabile nel tempo (requisito Slice 0: "origine e
   versione note").

## Fasi

| # | Azione | Strumento | Output | Stato |
|---|---|---|---|---|
| 1 | Review dello script exporter (solo GET, dry run default) | revisione manuale | script approvato | vedi RUNBOOK |
| 2 | Dry run (nessuna rete) | `export-button-live-readonly.ps1` | anteprima endpoint/destinazione | vedi RUNBOOK |
| 3 | Export read-only | `export-button-live-readonly.ps1 -ExecuteReadOnly` | `exports/<timestamp>/button-live-app.html` + manifest | vedi 03 |
| 4 | Hash e dimensione | SHA-256 nel manifest | checksum report (AUD-003) | vedi 03 |
| 5 | Inventario statico del sorgente | analisi testuale locale, senza esecuzione | `03_LIVE_SOURCE_MANIFEST.md` (AUD-004/005 parziale) | vedi 03 |
| 6 | Prima parity checklist | evidenze dal sorgente | `04_BUTTON_PARITY_CHECKLIST.md` (AUD-011/ORG-001 bozza) | vedi 04 |

## Cosa questo piano NON copre (richiede accessi mancanti)

| Attività board | Perché bloccata |
|---|---|
| AUD-006 inventario schema DB | serve accesso dashboard/CLI al progetto Supabase |
| AUD-007 inventario RLS e ruoli | idem |
| AUD-008 mappa segreti | serve accesso agli ambienti |
| AUD-009 backup DB e storage | serve accesso owner del progetto |
| AUD-010 restore isolato | dipende da AUD-009 |

I blocker sono tracciati in `05_ACCESS_AND_BLOCKERS.md`.

## Criteri di accettazione dell'export

- HTTP 200 con **esattamente un** record; zero o più di uno = anomalia registrata,
  nessuna scelta arbitraria del record;
- file salvato solo sotto `exports/<timestamp>/` (ignorato da Git);
- manifest con SHA-256, byte, data/ora UTC, endpoint sanitizzato;
- nessuna chiave o token integrale nei log o nei manifest;
- produzione invariata (solo GET).

## Ripetibilità

Un secondo export in una data successiva, confrontato per hash con il primo, permette
di dire se la versione live è cambiata durante l'audit (requisito M0: "produzione
invariata durante l'audit"). Procedura in `RUNBOOK.md`.
