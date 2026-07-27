# 06 — Roles MVP implementation plan (ADMIN / DIREZIONE / STAFF)

Piano di implementazione dei tre profili iniziali (DEC-014/015/016, AUTH-000 DONE,
AUTH-001 READY). **Nessun passo di questo piano è stato eseguito su database o
Auth reali**: la Slice 0 prepara soltanto template e criteri.

## Prerequisiti (bloccanti)

1. **Ambiente staging separato dalla produzione Button** (Q-TECH-004): nuovo
   progetto o branch Supabase isolato. Nessun account si crea prima di questo.
2. **Accesso verificato al progetto Supabase** (Q-TECH-002) e Technical Owner
   nominato (GOV-002).
3. **Foundation Slice 1 avviata**: tabelle organizations/membership disponibili,
   perché ruoli e permessi sono scopati per `organization_id`.

## Passi previsti (in staging, Slice 1)

| # | Passo | Artefatto | Guardrail |
|---|---|---|---|
| 1 | Creare organizzazione di staging | record org + uuid | nessun dato di produzione |
| 2 | Eseguire `roles_mvp_seed_template.sql` con placeholder sostituiti | 3 ruoli + permessi + audit seed | idempotente; doppia esecuzione = zero duplicati |
| 3 | Definire policy RLS deny-by-default sui permessi (AUTH-004) | RLS matrix + migration | nessuna tabella esposta al ruolo `anon` |
| 4 | Creare gli account demo `demo-admin`, `demo-direzione`, `demo-staff` in Supabase Auth di staging | 3 account di test | credenziali generate in staging, mai nel repo (DEC-016) |
| 5 | Collegare account ↔ ruolo via membership | membership records | un grant per riga, auditato |
| 6 | Eseguire i 15 test RLS di `database/roles_mvp_permissions.md` | test report | tutti verdi prima di procedere |
| 7 | Test edge case multi-ruolo (stessa persona ADMIN+DIREZIONE) | test report | primo ≠ secondo approvatore sempre |
| 8 | Registrare l'esito nel decision log / execution board | evidenza AUTH-001 | `DONE` solo con evidenza |

## Vincoli non negoziabili

- `ADMIN` ≠ `DIREZIONE`: nessuna eredità implicita tra i due (DEC-015).
- `ADMIN` **non approva payroll** per default: il permesso `payroll.approve` nasce
  `false` e non va abilitato se non tramite doppia nomina esplicita.
- `STAFF` opera con scope `OWN` su dati economici e personali.
- Ogni assegnazione/revoca di ruolo produce una riga di audit; l'audit non si
  cancella per nessun ruolo.
- Nessuna password, magic link o email personale entra nel repository.
- Il template SQL resta "STAGING TEMPLATE — DO NOT RUN ON PRODUCTION" finché non
  esiste un ambiente staging approvato.

## Cosa NON fa questo piano

- Non tocca la produzione Button né le tabelle legacy `bfos_*`.
- Non crea utenti reali (solo i tre demo di staging, quando lo staging esisterà).
- Non definisce i ruoli specializzati post-pilot (`HR`, `FINANCE`, ecc.): il modello
  li supporta ma restano fuori dall'MVP (doc 32 §Evoluzione futura).

## Mappatura legacy → MVP (da decidere per persona, non in blocco)

| Legacy (app live) | Candidato MVP | Nota |
|---|---|---|
| `admin` | ADMIN e/o DIREZIONE | scelta per responsabilità reale, con decisione registrata |
| `viewer` | STAFF (o DIREZIONE read-only) | valutare caso per caso |

La mappatura si applica solo in migrazione (Slice 2), mai sugli account legacy in
produzione.
