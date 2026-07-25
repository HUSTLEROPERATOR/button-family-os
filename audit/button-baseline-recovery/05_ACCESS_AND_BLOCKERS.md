# 05 — Access and blockers

Stato aggiornato al 2026-07-25 (Slice 0 eseguita in modalità read-only).

## Cosa è stato verificato

| Verifica | Esito | Evidenza |
|---|---|---|
| Branch e working tree puliti prima delle scritture locali | OK | `00_PREFLIGHT.md` |
| Loader `index.html` analizzato senza modifiche | OK | `01_LOADER_AUDIT.md` |
| GET pubblica del loader funzionante (HTTP 200, 1 record) | OK | run `20260725-025330Z` |
| App live esportata, hash e dimensione registrati | OK | `03_LIVE_SOURCE_MANIFEST.md`, SHA-256 `16DA6043…ACEDC`, 192.478 byte |
| Inventario statico tabelle/RPC/moduli dell'app | OK | `03_LIVE_SOURCE_MANIFEST.md` |
| Prima parity checklist (24 funzioni osservate + 2 UNKNOWN) | OK | `04_BUTTON_PARITY_CHECKLIST.md` |
| Template ruoli MVP preparato e NON eseguito | OK | `database/roles_mvp_seed_template.sql` |
| Nessuna scrittura remota, nessun deploy, nessun push | OK | solo GET; verifica finale git |

## Quale progetto Supabase sembra essere usato

- Project ref: `mbd***zzv` (valore completo in `index.html` r. 22; 20 caratteri).
- La schermata Impostazioni dell'app lo chiama "**button-family-os**".
- Loader e app usano la **stessa** chiave publishable → un solo progetto per asset
  di caricamento e dati operativi.
- Piano presumibilmente free (il loader gestisce esplicitamente il caso "progetto
  in pausa"), quindi a rischio pausa per inattività.

## Cosa NON è accessibile (blocker)

| ID | Blocker | Blocca | Serve |
|---|---|---|---|
| B-01 | Accesso dashboard/CLI del progetto Supabase (Q-TECH-002) | AUD-006..AUD-010 (schema, RLS, utenti, storage, backup, restore) | identificare l'account owner e nominare il Technical Owner (GOV-002) |
| B-02 | Verifica delle policy RLS reali del ruolo `anon` | conferma/smentita del rischio "scritture con chiave pubblica" (03 §rischi) | B-01; in alternativa NESSUN test attivo: non si provano scritture contro la produzione |
| B-03 | Conteggi record per tabella (`bfos_members`, ecc.) | acceptance Slice 0 "conteggi coerenti" | B-01 (le SELECT con chiave pubblica sarebbero tecnicamente possibili ma toccano dati utente: fuori perimetro autorizzato di questo audit) |
| B-04 | Backup database e storage (AUD-009) e restore isolato (AUD-010) | gate M0 completo | B-01 + runbook approvato |
| B-05 | Ambiente staging separato (Q-TECH-004) | creazione demo-admin/direzione/staff, esecuzione template SQL, test RLS | decisione owner + progetto/branch staging |

## Operazioni che restano bloccate finché i blocker non si chiudono

- Qualsiasi esecuzione di `roles_mvp_seed_template.sql`.
- Creazione di qualsiasi account (anche demo).
- Backup/restore e inventario schema completo.
- Chiusura del gate M0 (oggi la baseline copre **solo l'app**, non schema+dati).
- Qualsiasi modifica ad app live, RLS, Auth o storage.

## Dati che NON vanno chiesti all'utente in chiaro

- Password o credenziali della dashboard Supabase.
- Chiavi `service_role` o `sb_secret_*`.
- Password degli account `bfos_users` (né attuali né future).
- Token Discord/Twitch o di altre integrazioni.
- Qualsiasi export contenente dati personali dei membri (nick, Discord ID,
  telefoni): se servirà, va condiviso tramite canale sicuro concordato, non in chat
  né nel repo.

Per sbloccare B-01 è sufficiente che l'owner **confermi di avere accesso** alla
dashboard del progetto `mbd***zzv` e chi ne è titolare — non servono credenziali in
chat.

## Prossimo comando sicuro

Ripetere l'export read-only per verificare che la produzione sia invariata
(confronto hash con la baseline registrata):

```powershell
.\audit\button-baseline-recovery\scripts\export-button-live-readonly.ps1 -ExecuteReadOnly
```

Qualsiasi passo oltre questo (schema, RLS, backup, conteggi) richiede prima la
chiusura di B-01.
