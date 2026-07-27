# 35 — Slice 0 reconciliation

## Scopo

Riconciliare il blueprint generale con le evidenze reali prodotte dal branch `audit/button-baseline-recovery` e impedire che roadmap, todolist e decision queue descrivano uno stato precedente.

## Baseline osservata

| Campo | Valore |
|---|---|
| Data export | 2026-07-25 |
| Metodo | GET read-only equivalente al loader pubblico |
| HTTP | 200 |
| Record | 1 |
| Dimensione | 192.478 byte |
| Righe | 2.733 |
| SHA-256 | `16DA604373877C94FDDF0C6A4BCAF64758774ED9C55B1C57B1EADA4C747ACEDC` |
| Esecuzione HTML | mai eseguito |
| Produzione modificata | no |
| Export in Git | no |

## Evidenze disponibili

- loader auditato;
- exporter PowerShell GET-only, dry run di default;
- manifest della baseline;
- inventario statico dell'app;
- prima parity checklist;
- registro blocker;
- piano ruoli `ADMIN`, `DIREZIONE`, `STAFF`;
- richiesta accesso tecnico B-01;
- checklist B-01;
- piano Slice 1 Secure Foundation.

## Risultati applicativi

- 21 funzioni `CONFIRMED`;
- 3 funzioni `PARTIAL`;
- 2 funzioni `UNKNOWN`;
- 8 tab principali;
- 13 tabelle `bfos_*` referenziate;
- 2 RPC legacy osservate;
- nessuna dipendenza CDN osservata;
- enforcement legacy principalmente client-side;
- possibili scritture e cancellazioni con chiave publishable da verificare sulle RLS reali.

## Cosa è chiuso

- recupero dell'HTML live;
- hash e dimensione della versione osservata;
- inventario statico della UI e delle funzioni principali;
- primo confronto tra comportamento live e requisiti futuri;
- protezione dell'export tramite `.gitignore`;
- documentazione dei rischi più gravi;
- preparazione dei tre ruoli MVP senza esecuzione SQL.

## Cosa non è chiuso

- Technical Owner;
- accesso dashboard/CLI nominativo;
- progetto e organizzazione Supabase confermati dall'owner;
- schema, RLS, Auth, Storage, trigger, funzioni e cron;
- conteggi e consistenza dati;
- backup completo;
- restore isolato;
- staging separato;
- approvazione formale della lista delle funzioni Button da mantenere;
- parity completa tra manuale e applicazione.

## Aggiornamenti applicati al blueprint

- `03_CURRENT_STATE_AUDIT.md`: stato Slice 0 e checklist aggiornati;
- `09_DATA_MODEL.md`: collisione `corrective_actions` eliminata;
- `27_DECISION_LOG.md`: decisioni su baseline, export e registro fonti;
- `28_OPEN_QUESTIONS.md`: questioni parzialmente risolte e nuovi blocker;
- `30_EXECUTION_BOARD.md`: task riallineati alle evidenze reali;
- `36_SOURCE_REGISTER.md`: registro ufficiale delle fonti;
- `README.md`: percorso di lettura aggiornato.

## Gate M0

M0 resta `IN_PROGRESS`.

```text
APP BASELINE       = RECOVERED
FUNCTION INVENTORY = IN_REVIEW
BACKEND BASELINE   = BLOCKED BY B-01
BACKUP / RESTORE   = BLOCKED
STAGING            = BLOCKED
M0                 = NOT CLOSED
```

## Prossima azione unica

Chiudere B-01 tramite conferma del Technical Owner e invito nominativo al progetto Supabase corretto. Senza questa evidenza non sono autorizzate migrazioni, account reali, SQL, modifiche RLS o deploy.
