# 09 — Data model

## Regole trasversali

Quasi tutte le entità operative devono contenere `id`, `organization_id`, `season_id`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by`, `version`, eventuale `archived_at` e metadati di audit.

## Identità e struttura

`users`, `characters`, `servers`, `organizations`, `locations`, `seasons`, `memberships`, `roles`, `permissions`, `role_permissions`, `membership_roles`.

## Persone e HR

`employees`, `applications`, `onboarding_steps`, `skills`, `employee_skills`, `training_modules`, `training_progress`, `shifts`, `attendance`, `evaluations`, `goals`.

## CRM e partner

`customers`, `customer_contacts`, `customer_segments`, `suppliers`, `partners`, `agreements`, `discount_rules`.

## Catalogo e operations

`catalog_versions`, `services`, `products`, `price_lists`, `price_list_items`, `quotes`, `work_orders`, `work_order_items`, `work_order_assignments`, `vehicles`, `vehicle_history`, `quality_checks`.

## Commerciale e magazzino

`sales`, `sale_items`, `payments`, `refunds`, `purchase_orders`, `purchase_items`, `goods_receipts`, `inventory_items`, `inventory_movements`, `stock_counts`, `stock_count_lines`.

## Finanza

`accounts`, `cash_movements`, `budgets`, `budget_lines`, `financial_periods`, `reconciliations`, `receivables`, `payables`.

## Payroll

`payroll_contracts`, `payroll_rules`, `payroll_periods`, `payroll_runs`, `payroll_entries`, `payroll_components`, `bonuses`, `benefits`, `advances`, `payroll_disputes`.

## Ecosistema

`events`, `event_staff`, `event_budgets`, `sponsors`, `sponsorships`, `campaigns`, `campaign_results`, `investments`, `loans`, `loan_installments`, `incidents`, `corrective_actions`.

## Knowledge e audit

`procedures`, `procedure_versions`, `documents`, `notifications`, `integration_deliveries`, `audit_events`, `decision_records`.

## Invarianti

- un record economico approvato non si modifica silenziosamente;
- una giacenza deriva da movimenti;
- un periodo paga chiuso usa una snapshot delle regole;
- un ordine chiuso conserva prezzi, sconti e assegnazioni del momento;
- un cambio wipe non riassegna retroattivamente i record;
- ogni record multi-tenant ha `organization_id`;
- ogni accesso sensibile è verificato sul backend/RLS;
- eliminazioni economiche avvengono tramite storno o annullamento tracciato.

## Relazioni chiave

```text
organization
  ├── memberships
  ├── locations
  ├── seasons
  ├── customers
  ├── suppliers
  ├── work_orders
  ├── inventory
  ├── cash_movements
  └── payroll_periods

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