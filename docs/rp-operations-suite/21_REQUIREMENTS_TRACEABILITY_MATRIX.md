# 21 — Requirements traceability matrix

## Obiettivo

Garantire che ogni requisito abbia origine, decisione, task, dati, UI/API, test, release ed evidenza.

## Matrice iniziale

| Requisito | Modulo | Task principali | Dati | Test | Milestone |
|---|---|---|---|---|---|
| FR-CORE-001 multi-organizzazione | Core | ARCH-002, DATA-001, AUTH-002 | organizations, memberships | TEST-002/003 | M2 |
| FR-CORE-004 wipe/stagioni | Core | DATA-004, ORG-008 | seasons, catalog_versions | TEST-002/006 | M3 |
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
| FR-BUS-015 prestiti/imprevisti | Finance | LOAN-001..005, RISK-001..005 | loans, incidents | TEST-001/006 | M7 |
| FR-TNT-001 cliente/veicolo | TNT | TNT-002/003 | vehicles, customers | TEST-006 | M6 |
| FR-TNT-006 consegna/incasso | TNT | TNT-007/008 | quality_checks, payments | TEST-006 | M6 |
| NFR-002 RLS | Security | AUTH-004/005, SEC-001 | policies | TEST-003 | M2 |
| NFR-004 backup/restore | Security | AUD-009/010, SEC-004 | backup artifacts | restore drill | M0/M9 |
| NFR-007 idempotenza | Core | PAY-011, DIS-005 | run keys, delivery logs | TEST-001/002 | M5/M8 |

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
- requisito pianificato in release ma non `APPROVED`.