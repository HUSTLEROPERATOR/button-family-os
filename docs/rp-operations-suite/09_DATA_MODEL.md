# 09 — Data model

## Regole trasversali

Quasi tutte le entità operative devono contenere `id`, `organization_id`, `season_id`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by`, `version`, eventuale `archived_at` e metadati di audit.

Le configurazioni derivate da fonti in bozza devono includere anche `source_document_id`, `approval_status`, `effective_from`, `effective_to`, `approved_by` e `approved_at`.

## Identità e struttura

`users`, `characters`, `servers`, `organizations`, `locations`, `seasons`, `memberships`, `roles`, `permissions`, `role_permissions`, `membership_roles`.

## Organization OS — membri, onboarding e governance

`organization_members`, `tutor_assignments`, `probation_periods`, `probation_objectives`, `probation_evidence`, `member_reviews`, `member_review_scores`, `member_outcomes`, `organization_principles`, `organization_policies`, `policy_versions`, `policy_acknowledgements`, `configuration_proposals`, `configuration_approvals`.

## Organization OS — operazioni e risorse

`activity_logs`, `activity_participants`, `activity_transactions`, `activity_resource_movements`, `result_allocations`, `missions`, `mission_participants`, `mission_assets`, `mission_authorizations`, `mission_debriefs`, `deposits`, `personal_kits`, `operational_outfits`, `operational_vehicles`, `access_grants`, `access_reviews`, `access_review_items`.

## Organization OS — intelligence, problemi e valutazioni

`intelligence_reports`, `intelligence_sources`, `intelligence_links`, `relationship_contacts`, `procedure_issues`, `temporary_decisions`, `decision_reviews`, `corrective_actions`, `disciplinary_actions`, `recurring_checklist_templates`, `recurring_checklist_runs`, `recurring_checklist_items`.

## Persone e HR Business

`employees`, `applications`, `onboarding_steps`, `skills`, `employee_skills`, `training_modules`, `training_progress`, `shifts`, `attendance`, `evaluations`, `goals`.

## CRM e partner

`customers`, `customer_contacts`, `customer_segments`, `suppliers`, `partners`, `agreements`, `discount_rules`.

## Catalogo e operations Business

`catalog_versions`, `services`, `products`, `price_lists`, `price_list_items`, `quotes`, `work_orders`, `work_order_items`, `work_order_assignments`, `vehicles`, `vehicle_history`, `quality_checks`.

## Commerciale e magazzino

`sales`, `sale_items`, `payments`, `refunds`, `purchase_orders`, `purchase_items`, `goods_receipts`, `inventory_items`, `inventory_movements`, `stock_counts`, `stock_count_lines`.

## Finanza

`accounts`, `cash_movements`, `budgets`, `budget_lines`, `financial_periods`, `reconciliations`, `receivables`, `payables`.

## Payroll

`payroll_contracts`, `payroll_rules`, `payroll_periods`, `payroll_runs`, `payroll_entries`, `payroll_components`, `bonuses`, `benefits`, `advances`, `payroll_disputes`.

## Ecosistema

`events`, `event_staff`, `event_budgets`, `event_attendance`, `sponsors`, `sponsorships`, `campaigns`, `campaign_results`, `investments`, `loans`, `loan_installments`, `incidents`, `corrective_actions`.

## Knowledge, fonti e audit

`source_documents`, `source_document_versions`, `source_requirement_links`, `procedures`, `procedure_versions`, `documents`, `notifications`, `integration_deliveries`, `audit_events`, `decision_records`.

## Stati principali

### Fonti e procedure

```text
SOURCE_DRAFT → IN_REVIEW → APPROVED | REJECTED | SUPERSEDED
```

### Prova affiliato

```text
CANDIDATE → PROBATION → REVIEW_DUE → APPROVED | EXTENDED | ROLE_CHANGED | REJECTED
```

### Missione

```text
DRAFT → SUBMITTED → APPROVED → ACTIVE → DEBRIEF_DUE → CLOSED
```

### Problema procedurale

```text
REPORTED → TRIAGED → TEMPORARY_DECISION → REVIEW_DUE → APPROVED | MODIFIED | REJECTED
```

### Intelligence

```text
RUMOR | UNVERIFIED | PARTIALLY_VERIFIED | VERIFIED | DISPROVED
```

## Invarianti

- un record economico approvato non si modifica silenziosamente;
- una giacenza deriva da movimenti;
- un periodo paga chiuso usa una snapshot delle regole;
- un ordine chiuso conserva prezzi, sconti e assegnazioni del momento;
- un cambio wipe non riassegna retroattivamente i record;
- ogni record multi-tenant ha `organization_id`;
- ogni accesso sensibile è verificato sul backend/RLS;
- eliminazioni economiche avvengono tramite storno o annullamento tracciato;
- una proposta proveniente da `SOURCE_DRAFT` non può essere `ACTIVE` senza approvazione;
- ogni target, quota, sconto o periodicità ha organizzazione, stagione, unità e versione;
- un quick log Discord non è il record ufficiale finché non viene consolidato nell'app;
- una decisione temporanea deve avere review date;
- Staff non approva il proprio esito, bonus, limitazione o provvedimento;
- ogni inventario/revisione accessi conserva responsabili, differenze e follow-up;
- il grado di verifica di un'intelligence non può essere elevato senza autore ed evidenza;
- le valutazioni non producono automaticamente promozioni o sanzioni.

## Relazioni chiave

```text
organization
  ├── memberships
  ├── seasons
  ├── policy_versions
  ├── probation_periods
  ├── activity_logs
  ├── missions
  ├── deposits/access_reviews
  ├── intelligence_reports
  ├── procedure_issues/decisions
  ├── customers/suppliers
  ├── work_orders
  ├── inventory
  ├── cash_movements
  └── payroll_periods

probation_period
  ├── member
  ├── tutor_assignment
  ├── objectives
  ├── evidence
  ├── review_scores
  └── outcome/approval

mission
  ├── participants
  ├── assets
  ├── authorizations
  ├── activity_transactions
  ├── inventory_movements
  └── debrief

procedure_issue
  ├── policy_version
  ├── temporary_decision
  ├── review
  └── final decision

work_order
  ├── customer
  ├── vehicle
  ├── assignments → employee
  ├── items → service/product
  ├── inventory_movements
  └── sale/payment

payroll_period
  ├── rule snapshots
  ├── sales/work source records
  ├── entries → employee
  ├── approvals
  └── payment status
```