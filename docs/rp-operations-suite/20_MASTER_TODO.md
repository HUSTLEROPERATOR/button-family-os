# 20 — Master todo

## Regole del backlog

Stati ammessi: `PROPOSED`, `NEEDS_CLARIFICATION`, `APPROVED`, `READY`, `IN_PROGRESS`, `BLOCKED`, `IN_REVIEW`, `DONE`, `DEFERRED`, `REJECTED`.

Priorità:
- `P0`: sicurezza, dati, blocco release;
- `P1`: necessario per MVP;
- `P2`: necessario per pilota completo;
- `P3`: evoluzione;
- `P4`: futuro.

Un task è `DONE` solo con criteri di accettazione verificati, test, documentazione aggiornata, evidenza, nessuna regressione nota e approvazione quando richiesta.

## Template task

```yaml
id:
title:
phase:
module:
priority:
status:
owner:
dependencies: []
description:
acceptance_criteria: []
tests: []
evidence:
release:
```

## GOV — Governance

| ID | Task | Priorità |
|---|---|---:|
| GOV-001 | Nominare product owner | P0 |
| GOV-002 | Nominare responsabile tecnico | P0 |
| GOV-003 | Nominare owner Button e owner TNT | P0 |
| GOV-004 | Definire RACI | P0 |
| GOV-005 | Definire processo approvazioni | P0 |
| GOV-006 | Definire Definition of Ready | P1 |
| GOV-007 | Definire Definition of Done | P1 |
| GOV-008 | Definire change control | P1 |
| GOV-009 | Definire calendario review | P2 |
| GOV-010 | Definire escalation e blocchi | P1 |

## AUD — Audit e baseline

| ID | Task | Priorità |
|---|---|---:|
| AUD-001 | Snapshot `main` e versione live | P0 |
| AUD-002 | Esportare app servita da Supabase | P0 |
| AUD-003 | Calcolare hash della baseline | P0 |
| AUD-004 | Inventariare asset | P0 |
| AUD-005 | Inventariare dipendenze e licenze | P0 |
| AUD-006 | Inventariare tabelle/viste/funzioni/trigger | P0 |
| AUD-007 | Inventariare RLS e ruoli | P0 |
| AUD-008 | Mappare variabili ambiente e segreti | P0 |
| AUD-009 | Eseguire backup DB e storage | P0 |
| AUD-010 | Provare restore isolato | P0 |
| AUD-011 | Documentare baseline funzionale Button | P0 |
| AUD-012 | Elencare bug e debito tecnico | P1 |
| AUD-013 | Inventariare manuali e materiali Discord | P1 |
| AUD-014 | Classificare requisito esistente/richiesto/futuro | P1 |

## ARCH — Architettura

| ID | Task | Priorità |
|---|---|---:|
| ARCH-001 | Confermare domini e confini | P0 |
| ARCH-002 | Definire multi-tenancy | P0 |
| ARCH-003 | Definire organizzazioni/sedi/reparti | P0 |
| ARCH-004 | Definire strategia configurazioni | P0 |
| ARCH-005 | Definire cataloghi versionati | P0 |
| ARCH-006 | Definire eventi di dominio | P1 |
| ARCH-007 | Definire ambienti | P0 |
| ARCH-008 | Definire feature flags | P1 |
| ARCH-009 | Definire import/export | P2 |
| ARCH-010 | Definire osservabilità | P1 |
| ARCH-011 | Definire adapter integrazioni | P2 |
| ARCH-012 | Scrivere ADR fondamentali | P1 |

## DATA — Modello dati

| ID | Task | Priorità |
|---|---|---:|
| DATA-001 | Disegnare ERD Shared Core | P0 |
| DATA-002 | Disegnare ERD Organization OS | P0 |
| DATA-003 | Disegnare ERD Business OS | P0 |
| DATA-004 | Definire stati entità | P0 |
| DATA-005 | Definire invarianti economiche | P0 |
| DATA-006 | Definire retention e archiviazione | P1 |
| DATA-007 | Definire ID e versioning | P1 |
| DATA-008 | Definire seed/demo data | P1 |
| DATA-009 | Definire indici e performance | P2 |
| DATA-010 | Generare tipi TypeScript | P1 |
| DATA-011 | Definire migrazioni iniziali | P0 |
| DATA-012 | Definire strategia soft delete/storno | P0 |

## AUTH — Accessi, permessi e audit

| ID | Task | Priorità |
|---|---|---:|
| AUTH-001 | Configurare autenticazione | P0 |
| AUTH-002 | Implementare membership | P0 |
| AUTH-003 | Implementare ruoli e permessi | P0 |
| AUTH-004 | Implementare RLS deny-by-default | P0 |
| AUTH-005 | Testare tenant isolation | P0 |
| AUTH-006 | Gestire deleghe temporanee | P2 |
| AUTH-007 | Audit azioni sensibili | P0 |
| AUTH-008 | Definire access review | P2 |
| AUTH-009 | Proteggere export e allegati | P1 |
| AUTH-010 | Definire separazione dei compiti | P1 |

## ORG — Button / Organization OS

| ID | Task | Priorità |
|---|---|---:|
| ORG-001 | Inventariare parity Button | P0 |
| ORG-002 | Modellare gerarchia e livelli | P1 |
| ORG-003 | Modellare missioni e obiettivi | P1 |
| ORG-004 | Modellare valutazioni/promozioni | P1 |
| ORG-005 | Collegare manuali e procedure | P1 |
| ORG-006 | Separare IC e OOC | P1 |
| ORG-007 | Gestire accordi e risorse | P2 |
| ORG-008 | Gestire wipe/stagioni | P1 |
| ORG-009 | Importare dati Button | P0 |
| ORG-010 | Eseguire regression test Button | P0 |

## HR — Personale e turni

| ID | Task | Priorità |
|---|---|---:|
| HR-001 | Anagrafica dipendenti | P1 |
| HR-002 | Candidature e onboarding | P1 |
| HR-003 | Ruoli/reparti/sedi | P1 |
| HR-004 | Disponibilità e turni | P1 |
| HR-005 | Presenze e anomalie | P2 |
| HR-006 | Competenze e formazione | P1 |
| HR-007 | Valutazioni e obiettivi | P2 |
| HR-008 | Carriera e stati | P2 |
| HR-009 | Sospensioni e cessazioni | P2 |
| HR-010 | Dashboard personale | P2 |

## CRM — Clienti, sconti e convenzioni

| ID | Task | Priorità |
|---|---|---:|
| CRM-001 | Schede clienti | P1 |
| CRM-002 | Segmenti e VIP | P2 |
| CRM-003 | Storico interazioni/lavori | P1 |
| CRM-004 | Regole sconto | P1 |
| CRM-005 | Sconti personale | P2 |
| CRM-006 | Convenzioni | P1 |
| CRM-007 | Limiti e scadenze | P1 |
| CRM-008 | Reclami e note | P2 |
| CRM-009 | Crediti e insolvenze | P2 |
| CRM-010 | Controlli cumulabilità | P1 |

## SALE — Catalogo, preventivi e vendite

| ID | Task | Priorità |
|---|---|---:|
| SALE-001 | Catalogo servizi/prodotti | P1 |
| SALE-002 | Listini versionati | P1 |
| SALE-003 | Preventivi | P1 |
| SALE-004 | Ordini di lavoro | P1 |
| SALE-005 | Assegnazioni e stati | P1 |
| SALE-006 | Vendite e pagamenti | P1 |
| SALE-007 | Pagamenti parziali | P2 |
| SALE-008 | Rimborsi/annullamenti | P2 |
| SALE-009 | Margini e KPI | P2 |
| SALE-010 | Blocchi sconto/prezzo fuori soglia | P1 |

## PUR — Acquisti e fornitori

| ID | Task | Priorità |
|---|---|---:|
| PUR-001 | Anagrafica fornitori | P1 |
| PUR-002 | Richieste acquisto | P1 |
| PUR-003 | Approvazione ordini | P1 |
| PUR-004 | Ordini e ricezioni | P1 |
| PUR-005 | Ricezioni parziali | P2 |
| PUR-006 | Pagamenti fornitori | P2 |
| PUR-007 | Resi e contestazioni | P3 |
| PUR-008 | Scadenze e lead time | P2 |

## INV — Magazzino

| ID | Task | Priorità |
|---|---|---:|
| INV-001 | Anagrafica articoli | P1 |
| INV-002 | Movimenti inventario | P1 |
| INV-003 | Soglie e alert | P1 |
| INV-004 | Trasferimenti sedi | P2 |
| INV-005 | Inventario periodico | P1 |
| INV-006 | Rettifiche approvate | P1 |
| INV-007 | Valorizzazione magazzino | P2 |
| INV-008 | Test concorrenza/duplicati | P1 |
| INV-009 | Perdite/danni/resi | P2 |
| INV-010 | Report differenze inventariali | P2 |

## FIN — Finanza e cassa

| ID | Task | Priorità |
|---|---|---:|
| FIN-001 | Conti e categorie | P1 |
| FIN-002 | Movimenti cassa | P1 |
| FIN-003 | Entrate/uscite previste e reali | P1 |
| FIN-004 | Riconciliazione | P1 |
| FIN-005 | Budget | P2 |
| FIN-006 | Cash flow | P2 |
| FIN-007 | Crediti e debiti | P2 |
| FIN-008 | Report direzionali | P1 |
| FIN-009 | Chiusura periodo | P1 |
| FIN-010 | Alert economici | P2 |

## PAY — Payroll

| ID | Task | Priorità |
|---|---|---:|
| PAY-001 | Contratti stipendiali | P0 |
| PAY-002 | Formula fissa | P0 |
| PAY-003 | Percentuale personale | P0 |
| PAY-004 | Percentuale aziendale | P0 |
| PAY-005 | Compenso per attività/turno | P1 |
| PAY-006 | Formula ibrida | P0 |
| PAY-007 | Bonus/premi/benefit | P1 |
| PAY-008 | Anticipi e rettifiche | P1 |
| PAY-009 | Periodicità configurabile | P0 |
| PAY-010 | Snapshot regole | P0 |
| PAY-011 | Job idempotente | P0 |
| PAY-012 | Simulazione | P1 |
| PAY-013 | Review e approvazione | P0 |
| PAY-014 | Pagamento | P1 |
| PAY-015 | Blocco periodo | P0 |
| PAY-016 | Riapertura versionata | P1 |
| PAY-017 | Contestazione | P2 |
| PAY-018 | Spiegazione calcolo | P0 |
| PAY-019 | Export prospetto | P2 |
| PAY-020 | Golden tests | P0 |

## TNT — Pilota automotive

| ID | Task | Priorità |
|---|---|---:|
| TNT-001 | Confermare processi post-wipe | P1 |
| TNT-002 | Scheda veicolo | P1 |
| TNT-003 | Accettazione e diagnosi | P1 |
| TNT-004 | Preventivo | P1 |
| TNT-005 | Ricambi e assegnazione | P1 |
| TNT-006 | Lavorazione e stati | P1 |
| TNT-007 | Controllo qualità | P1 |
| TNT-008 | Consegna e incasso | P1 |
| TNT-009 | Storico veicolo | P1 |
| TNT-010 | Formazione apprendisti | P2 |
| TNT-011 | Dashboard officina | P1 |
| TNT-012 | Eventi automotive | P2 |
| TNT-013 | Import materiali Discord | P2 |
| TNT-014 | UAT settimana completa | P0 |

## EVT/MKT — Eventi, sponsor e pubblicità

| ID | Task | Priorità |
|---|---|---:|
| EVT-001 | Scheda evento | P2 |
| EVT-002 | Budget evento | P2 |
| EVT-003 | Staff e partner | P2 |
| EVT-004 | Autorizzazioni/rischi | P2 |
| EVT-005 | Consuntivo evento | P2 |
| MKT-001 | Sponsor ricevuti | P2 |
| MKT-002 | Sponsorizzazioni acquistate | P2 |
| MKT-003 | Campagne | P2 |
| MKT-004 | KPI marketing | P3 |
| MKT-005 | Materiali e deliverable | P3 |

## LOAN/RISK — Prestiti, investimenti e imprevisti

| ID | Task | Priorità |
|---|---|---:|
| LOAN-001 | Prestiti ricevuti/concessi | P2 |
| LOAN-002 | Piani rate | P2 |
| LOAN-003 | Scadenze e alert | P2 |
| LOAN-004 | Investimenti e KPI/ROI | P2 |
| LOAN-005 | Anticipi dipendenti | P2 |
| RISK-001 | Registro imprevisti | P1 |
| RISK-002 | Azioni correttive | P2 |
| RISK-003 | Costi e responsabilità | P2 |
| RISK-004 | Review lezione appresa | P3 |
| RISK-005 | Escalation incidenti critici | P1 |

## DIS — Discord

| ID | Task | Priorità |
|---|---|---:|
| DIS-001 | Mappare canali e ruoli | P2 |
| DIS-002 | Definire notification rules | P2 |
| DIS-003 | Delivery queue | P2 |
| DIS-004 | Adapter Discord | P2 |
| DIS-005 | Retry/idempotenza | P1 |
| DIS-006 | Comandi read-only | P3 |
| DIS-007 | Privacy messaggi | P1 |
| DIS-008 | Log consegna | P2 |
| DIS-009 | Gestione bot offline | P2 |
| DIS-010 | Link autorizzati ai record | P1 |

## TEST/SEC/DEP — Qualità, sicurezza e rilascio

| ID | Task | Priorità |
|---|---|---:|
| TEST-001 | Unit test domini | P0 |
| TEST-002 | Integration test DB | P0 |
| TEST-003 | RLS/permission tests | P0 |
| TEST-004 | Payroll golden tests | P0 |
| TEST-005 | Inventory concurrency tests | P1 |
| TEST-006 | E2E critical paths | P0 |
| TEST-007 | Mobile/accessibility | P1 |
| TEST-008 | UAT Button | P0 |
| TEST-009 | UAT TNT | P0 |
| TEST-010 | Performance test | P2 |
| SEC-001 | Threat model | P0 |
| SEC-002 | Secret scanning | P0 |
| SEC-003 | Security advisors | P0 |
| SEC-004 | Backup/restore drill | P0 |
| SEC-005 | Access review | P1 |
| DEP-001 | CI pipeline | P0 |
| DEP-002 | Staging deploy | P0 |
| DEP-003 | Migration dry-run | P0 |
| DEP-004 | Release checklist | P0 |
| DEP-005 | Rollback drill | P0 |
| DEP-006 | Monitoring post-release | P1 |
| DEP-007 | Release notes | P1 |

## Dipendenze critiche

```text
AUD → ARCH/DATA → AUTH → FONDAZIONE
FONDAZIONE → MIGRAZIONE BUTTON
FONDAZIONE → BUSINESS CORE
BUSINESS CORE + FIN + SALE → PAYROLL
BUSINESS CORE + PAYROLL → TNT PILOT
EVENTI/LOAN/DISCORD → dopo stabilità core
TEST/SEC/DEP → trasversali, non solo finali
```

## Milestone

`M0 Baseline protetta`, `M1 Architettura approvata`, `M2 Foundation pronta`, `M3 Button parity`, `M4 Business Core`, `M5 Payroll`, `M6 TNT Pilot`, `M7 Advanced Operations`, `M8 Discord`, `M9 Production`, `M10 Productizzazione`.