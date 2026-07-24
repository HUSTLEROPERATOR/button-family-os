# RP Operations Suite — Blueprint documentale

Questa cartella definisce l'evoluzione di **Button's Family OS** verso una suite RP modulare senza alterare l'applicazione esistente.

## Principi vincolanti

- Button's Family OS resta l'implementazione criminale già valida.
- Business Operations OS è un dominio distinto, con TNT Automotive come primo pilota.
- Il sistema deve essere configurabile per officine, locali, casinò e altri business RP.
- Le variazioni di wipe, servizi, prezzi e procedure non devono richiedere modifiche al codice.
- Discord è un canale operativo e di notifica, non il database principale.
- Ogni calcolo economico deve essere spiegabile, versionato e sottoposto ad approvazione.
- Nessun requisito approvato può rimanere soltanto in chat: deve essere collegato a roadmap, task e test.

## Mappa documenti

1. `00_EXECUTIVE_OVERVIEW.md` — sintesi e decisioni approvate.
2. `01_PRODUCT_VISION.md` — prodotto, utenti e valore.
3. `02_SCOPE_AND_BOUNDARIES.md` — perimetro e limiti.
4. `03_CURRENT_STATE_AUDIT.md` — stato attuale e audit.
5. `04_SYSTEM_ARCHITECTURE.md` — architettura funzionale e tecnica.
6. `05_ORGANIZATION_OS.md` — dominio Button/criminale.
7. `06_BUSINESS_OPERATIONS_OS.md` — dominio business universale.
8. `07_TNT_AUTOMOTIVE_PILOT.md` — verticale officina.
9. `08_FUNCTIONAL_REQUIREMENTS.md` — requisiti funzionali e non funzionali.
10. `09_DATA_MODEL.md` — entità, relazioni e invarianti.
11. `10_PAYROLL_AND_REWARDS_ENGINE.md` — stipendi, bonus e premi.
12. `11_FINANCE_AND_CASHFLOW.md` — cassa, budget e rendicontazione.
13. `12_INVENTORY_PURCHASES_AND_SALES.md` — acquisti, vendite e magazzino.
14. `13_CUSTOMERS_DISCOUNTS_AND_AGREEMENTS.md` — CRM, sconti e convenzioni.
15. `14_EVENTS_SPONSORS_AND_MARKETING.md` — eventi, sponsor e pubblicità.
16. `15_LOANS_INVESTMENTS_AND_UNEXPECTED_COSTS.md` — prestiti, investimenti e imprevisti.
17. `16_DISCORD_INTEGRATION.md` — integrazione e confini.
18. `17_ROLES_PERMISSIONS_AND_AUDIT.md` — accessi e tracciabilità.
19. `18_WIPE_AND_SEASON_MANAGEMENT.md` — versionamento per wipe.
20. `19_MASTER_ROADMAP.md` — fasi, gate e dipendenze.
21. `20_MASTER_TODO.md` — backlog operativo.
22. `21_REQUIREMENTS_TRACEABILITY_MATRIX.md` — requisito → task → test → release.
23. `22_TEST_AND_ACCEPTANCE_PLAN.md` — strategia QA.
24. `23_MIGRATION_PLAN.md` — migrazione controllata Button.
25. `24_RELEASE_AND_DEPLOYMENT_PLAN.md` — ambienti, release e rollback.
26. `25_SECURITY_AND_BACKUP_PLAN.md` — sicurezza, backup e restore.
27. `26_RISK_REGISTER.md` — rischi e contromisure.
28. `27_DECISION_LOG.md` — decisioni approvate.
29. `28_OPEN_QUESTIONS.md` — decisioni ancora da prendere.

## Regola di aggiornamento

Ogni modifica funzionale deve aggiornare almeno requisito, task, modello dati se coinvolto, test e decision log quando cambia una scelta. La documentazione è un blueprint: non autorizza automaticamente migrazioni, deploy, modifiche a Supabase o merge.