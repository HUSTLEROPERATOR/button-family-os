# 24 — Release and deployment plan

## Branching

- `main`: produzione stabile;
- branch feature/docs;
- pull request;
- review;
- CI;
- merge autorizzato;
- deploy staging;
- approvazione produzione.

## Release train

Foundation; Button parity; Business Core; Payroll; TNT Pilot; Advanced Finance; Events/Marketing; Discord; Productization.

## Pipeline minima

1. lint;
2. typecheck;
3. unit test;
4. integration test;
5. RLS test;
6. build;
7. secret scan;
8. migration dry-run;
9. deploy preview/staging;
10. E2E smoke.

## Database deployment

Migrazioni numerate; forward plan; rollback o compensazione; backup prima di DDL critica; schema diff; staging first; nessuna modifica manuale non documentata.

## Go-live checklist

Release notes, versione, backup, restore verificato, migrazioni, feature flags, monitoring, owner, support channel, rollback window, comunicazione utenti e UAT approvata.

## Rollback

Disattivare feature; ripristinare versione app; applicare migrazione compensativa; usare restore solo quando necessario; comunicare impatto; aprire incident; produrre postmortem.

## Vincolo corrente

Questa documentazione non autorizza merge, deploy, modifica Supabase, modifica `index.html` o pubblicazione automatica.