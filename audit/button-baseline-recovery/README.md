# Audit — Button Baseline Recovery (Slice 0)

Audit **read-only** della baseline di Button's Family OS, secondo:

- `docs/rp-operations-suite/31_MVP_RELEASE_SLICES.md` — Slice 0 (Baseline Recovery);
- `docs/rp-operations-suite/19_MASTER_ROADMAP.md` — Fase 0;
- `docs/rp-operations-suite/30_EXECUTION_BOARD.md` — Pack 1 (AUD-001..AUD-004 parziali);
- `docs/rp-operations-suite/23_MIGRATION_PLAN.md` — Step 1 (freeze e snapshot).

## Perimetro

Questa attività:

- **non** modifica `main`, `index.html`, l'app live, Supabase, Auth, Storage o RLS;
- **non** crea account reali;
- **non** esegue deploy, push o merge;
- usa esclusivamente la **stessa GET pubblica** già eseguita dal loader `index.html`
  (`GET /rest/v1/bfos_assets?key=eq.app&select=content`);
- non salva chiavi o token nei documenti; gli export reali restano fuori da Git
  (vedi `exports/.gitignore`).

## Contenuto

| File | Scopo |
|---|---|
| `00_PREFLIGHT.md` | Verifica branch e working tree prima delle scritture locali |
| `01_LOADER_AUDIT.md` | Analisi del loader `index.html` (endpoint, header, rischi) |
| `02_SOURCE_RECOVERY_PLAN.md` | Piano di recupero read-only del sorgente live |
| `03_LIVE_SOURCE_MANIFEST.md` | Manifest della versione live recuperata (hash, dimensione, inventario) |
| `04_BUTTON_PARITY_CHECKLIST.md` | Prima parity checklist funzione/schermata con stato evidenza |
| `05_ACCESS_AND_BLOCKERS.md` | Cosa è verificato, cosa è bloccato, prossimo comando sicuro |
| `06_ROLES_MVP_IMPLEMENTATION_PLAN.md` | Piano implementazione ruoli `ADMIN`/`DIREZIONE`/`STAFF` (staging) |
| `RUNBOOK.md` | Procedura ripetibile di export read-only e verifica |
| `scripts/export-button-live-readonly.ps1` | Exporter GET-only, default dry run |
| `database/roles_mvp_seed_template.sql` | Template SQL idempotente ruoli MVP — **non eseguito** |
| `database/roles_mvp_permissions.md` | Matrice permessi MVP e test RLS richiesti |
| `exports/` | Destinazione export locali — **ignorata da Git** |

## Regole

1. Solo richieste GET read-only verso l'endpoint già pubblico del loader.
2. Nessun segreto, chiave o token nei file tracciati (le chiavi vengono mascherate).
3. L'HTML recuperato non viene eseguito, non viene aperto come app, non entra in Git.
4. Nessun commit automatico: ogni commit richiede approvazione esplicita.
5. In caso di 401/403 o anomalia: stop e registrazione del blocker in `05_ACCESS_AND_BLOCKERS.md`.
