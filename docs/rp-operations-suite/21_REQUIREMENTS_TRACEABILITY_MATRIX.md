# 21 — Requirements traceability matrix

## Obiettivo

Garantire che ogni requisito abbia origine, decisione, task, dati, UI/API, test, release ed evidenza.

## Matrice iniziale

| Requisito | Modulo | Task principali | Dati | Test | Milestone |
|---|---|---|---|---|---|
| FR-CORE-001 multi-organizzazione | Core | ARCH-002, DATA-001, AUTH-002 | organizations, memberships | TEST-002/003 | M2 |
| FR-CORE-004 wipe/stagioni | Core | DATA-004, ORG-008 | seasons, catalog_versions | TEST-002/006 | M3 |
| FR-AUTH-001 tre profili iniziali | Auth | AUTH-000, AUTH-001/002/003 | roles, permissions, membership_roles | TEST-003/006 | M2 |
| FR-AUTH-002 Admin | Auth | AUTH-001/003/007/009 | roles, permission grants, audit_events | TEST-003/006 | M2 |
| FR-AUTH-003 Direzione | Auth | AUTH-003/007/010 | permissions, approvals, audit_events | TEST-003/006 | M2/M5 |
| FR-AUTH-004 Staff | Auth | AUTH-003/004/005 | assignments, ownership, policies | TEST-003/006 | M2/M4 |
| FR-AUTH-005 separazione Admin/Payroll | Auth/Payroll | AUTH-010, PAY-013/015 | approvals, payroll_runs | TEST-003/004 | M5 |
| FR-AUTH-006 Direzione senza accesso tecnico | Auth | AUTH-003/004, SEC-001 | policies, secret scopes | TEST-003 | M2 |
| FR-AUTH-007 doppia approvazione | Auth/Finance | GOV-005, AUTH-010, PAY-013 | approval_rules, approvals | TEST-003/006 | M2/M5 |
| FR-AUTH-008 accessi negati verificabili | Security | AUTH-004/005/007 | audit_events, denied_events | TEST-003 | M2 |
| FR-AUTH-009 account demo staging | Foundation | AUTH-001, DATA-008, DEP-002 | auth users, seed memberships | TEST-002/006 | M2 |
| FR-AUTH-010 ruoli multipli auditati | Auth | AUTH-003/007 | membership_roles, active_role_context | TEST-003/006 | M2 |
| FR-ORG-001 procedure versionate | Organization | ORG-011/020/021 | source_documents, policy_versions, approvals | TEST-ORG-006 | M3 |
| FR-ORG-002 tutor | Organization | ORG-012/027 | tutor_assignments, probation_periods | TEST-ORG-001/007 | M3 |
| FR-ORG-003 periodo di prova | Organization | ORG-012/025/026 | probation_objectives, evidence, outcomes | TEST-ORG-001 | M3 |
| FR-ORG-004 depositi e dotazioni | Organization | ORG-013/029/031 | deposits, personal_kits, outfits, operational_vehicles | TEST-ORG-002 | M3 |
| FR-ORG-005 access review | Organization/Security | ORG-030 | access_grants, access_reviews | TEST-ORG-002/010 | M3 |
| FR-ORG-006 activity ledger | Organization | ORG-014/032 | activity_logs, transactions, result_allocations | TEST-ORG-008/010 | M3 |
| FR-ORG-007 mission planning | Organization | ORG-015/033 | missions, participants, assets, authorizations, debriefs | TEST-ORG-003 | M3 |
| FR-ORG-008 target configurabili | Organization/Core | ORG-020/043/044/045/046 | configuration_proposals, approvals, catalog_versions | TEST-ORG-006/009 | M3 |
| FR-ORG-009 intelligence RP | Organization/Security | ORG-016/034 | intelligence_reports, sources, links | TEST-ORG-005 | M3 |
| FR-ORG-010 eventi e relazioni | Organization/Events | ORG-038/039 | events, event_attendance, relationship_contacts | TEST-001/006 | M7 |
| FR-ORG-011 quote e vantaggi | Organization/Finance | ORG-040/041/042 | contributions, benefits, discount_rules | TEST-ORG-006/007 | M7 |
| FR-ORG-012 problemi e decisioni | Organization/Governance | ORG-017/035/036 | procedure_issues, temporary_decisions, decision_reviews | TEST-ORG-004/010 | M3 |
| FR-ORG-013 valutazioni/provvedimenti | Organization | ORG-018/028 | member_reviews, organization_corrective_actions, disciplinary_actions | TEST-ORG-001/007/010 | M3 |
| FR-ORG-014 checklist ricorrenti | Organization | ORG-019/031 | checklist_templates, runs, items | TEST-001/006 | M3 |
| FR-ORG-015 approvazione formale | Governance | ORG-020/037 | configuration_approvals, decision_records | TEST-ORG-006/010 | M3 |
| FR-ORG-016 quick log Discord | Organization/Discord | ORG-032, DIS-001..010 | integration_deliveries, activity_logs | TEST-ORG-008 | M8 |
| FR-ORG-017 errore buona fede | Organization | ORG-018/028 | evaluations, organization_corrective_actions | TEST-ORG-001/010 | M3 |
| FR-ORG-018 no auto-approvazione Staff | Auth/Organization | ORG-027/042, AUTH-010 | approvals, member_outcomes, benefits | TEST-ORG-007 | M3 |
| FR-BUS-001 personale | HR | HR-001..010 | employees, memberships | TEST-001/006 | M4 |
| FR-BUS-002 turni | HR | HR-004/005 | shifts, attendance | TEST-001/006 | M4 |
| FR-BUS-006 ordini di lavoro | Sales | SALE-003/004/005 | quotes, work_orders | TEST-001/006 | M4 |
| FR-BUS-007 vendite/pagamenti | Sales | SALE-006..010 | sales, payments | TEST-001/006 | M4 |
| FR-BUS-008 acquisti | Purchase | PUR-002..006 | purchase_orders | TEST-001/002 | M4 |
| FR-BUS-009 magazzino | Inventory | INV-001..010 | inventory_movements | TEST-005/006 | M4 |
| FR-BUS-010 cassa | Finance | FIN-001..010 | accounts, cash_movements | TEST-001/002 | M4 |
| FR-PAY-001 fisso | Payroll | PAY-001/002 | payroll_contracts/components | TEST-004 | M5 |
| FR-PAY-002 percentuale personale | Payroll | PAY-003/010/018 | sales, payroll_entries | TEST-004 | M5 |
| FR-PAY-003 percentuale aziendale | Payroll | PAY-004/010/018 | financial_periods, entries | TEST-004 | M5 |
| FR-PAY-005 formula ibrida | Payroll | PAY-006/007/010 | payroll_rules/components | TEST-004 | M5 |
| FR-PAY-008 job schedulato | Payroll | PAY-009/011 | payroll_runs | TEST-001/002 | M5 |
| FR-PAY-010 approvazione | Payroll | PAY-013/015 | approvals, audit_events | TEST-003/006 | M5 |
| FR-BUS-013 eventi | Events | EVT-001..005 | events, event_budgets | TEST-001/006 | M7 |
| FR-BUS-014 sponsor/campagne | Marketing | MKT-001..005 | sponsorships, campaigns | TEST-001 | M7 |
| FR-BUS-015 prestiti/imprevisti | Finance | LOAN-001..005, RISK-001..005 | loans, incidents, incident_corrective_actions | TEST-001/006 | M7 |
| FR-TNT-001 cliente/veicolo | TNT | TNT-002/003 | vehicles, customers | TEST-006 | M6 |
| FR-TNT-006 consegna/incasso | TNT | TNT-007/008 | quality_checks, payments | TEST-006 | M6 |
| NFR-002 RLS | Security | AUTH-004/005, SEC-001 | policies | TEST-003 | M2 |
| NFR-004 backup/restore | Security | AUD-009/010, SEC-004 | backup artifacts | restore drill | M0/M9 |
| NFR-007 idempotenza | Core | PAY-011, DIS-005 | run keys, delivery logs | TEST-001/002 | M5/M8 |
| NFR-011 fonte bozza inattiva | Governance | ORG-011/020/044 | source_documents, approvals | TEST-ORG-006 | M3 |
| NFR-012 dati classificati | Security/Organization | ORG-016/034, AUTH-004 | intelligence reports, visibility policies | TEST-ORG-005 | M3 |

## Fonti tracciate

| Source ID | Fonte | Stato | Documento integrazione/evidenza |
|---|---|---|---|
| `SRC-BUTTON-LIVE-001` | Button live app export 2026-07-25 | `OBSERVED_BASELINE` | audit Slice 0 + `35_SLICE_0_RECONCILIATION.md` |
| `SRC-GTA-RP-OPS-001` | GTA RP Manuale Operativo Bozza v1.0 | `SOURCE_DRAFT` | `33_MANUALE_OPERATIVO_GTA_RP_INTEGRATION.md` |

Il registro canonico completo è `36_SOURCE_REGISTER.md`.

## Procedura aggiornamento

Quando nasce un requisito:
1. assegnare ID;
2. indicare fonte e data;
3. classificare approvato/aperto;
4. creare task;
5. collegare schema;
6. definire test;
7. assegnare milestone;
8. allegare evidenza a completamento.

## Controlli automatici futuri

- requisito senza task;
- task senza requisito;
- requisito P0/P1 senza test;
- task `DONE` senza evidenza;
- test senza owner;
- requisito pianificato in release ma non `APPROVED`;
- configurazione attiva collegata soltanto a una fonte `SOURCE_DRAFT`;
- regola numerica senza organizzazione, stagione, unità o versione;
- entità dati con nome ambiguo tra domini;
- fonte senza Source ID, stato o posizione di conservazione.
