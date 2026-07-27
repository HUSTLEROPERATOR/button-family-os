# 04 — System architecture

## Architettura logica

```text
Client Web/PWA
  ├── Portale pubblico
  ├── Area staff
  ├── Area responsabili
  └── Area direzione
        |
API / Server Actions / Edge Functions
        |
Supabase
  ├── Auth
  ├── PostgreSQL
  ├── Row Level Security
  ├── Storage
  ├── Realtime selettivo
  └── Audit / scheduled jobs
        |
Integrations
  ├── Discord bot/webhook
  ├── Export PDF/CSV
  └── future server adapters
```

## Domini

- **Shared Core:** identità, organizzazioni, membership, ruoli, permessi, periodi, documenti, notifiche, configurazioni e audit.
- **Organization OS:** gerarchia, livelli, missioni, obiettivi, operazioni e progressione criminale.
- **Business Operations OS:** personale, CRM, ordini, vendite, acquisti, inventario, cassa, payroll, marketing e finanza avanzata.
- **Vertical Packs:** TNT Automotive, locale, casinò e altri moduli specifici.

## Principi tecnici

- multi-tenant tramite `organization_id`;
- isolamento dati con RLS;
- configurazione tramite cataloghi versionati;
- eventi di dominio per audit e notifiche;
- record economici immutabili dopo approvazione;
- correzioni tramite storno/versione, non sovrascrittura silenziosa;
- idempotenza per job automatici;
- timestamp e autore per ogni mutazione;
- stato esplicito anziché inferenze fragili;
- archiviazione per wipe/stagione.

## Ambienti

- `development`: dati sintetici;
- `staging`: copia sanificata o dataset pilota;
- `production`: dati reali RP;
- segreti separati;
- migrazioni prima in staging;
- feature flag per moduli non pronti.

## Moduli applicativi

```text
/app/dashboard
/app/people
/app/shifts
/app/customers
/app/suppliers
/app/catalog
/app/work-orders
/app/sales
/app/purchases
/app/inventory
/app/cash
/app/payroll
/app/discounts
/app/events
/app/marketing
/app/investments
/app/loans
/app/incidents
/app/procedures
/app/training
/app/reports
/app/settings
/app/audit
```

## Requisiti di qualità

Mobile-first; operazioni frequenti in massimo tre passaggi; ricerca e filtri; stati vuoti comprensibili; feedback di salvataggio; conferma azioni distruttive; audit accessibile alla direzione; esportazioni leggibili; accessibilità di base; prestazioni sostenibili con crescita dei record.