# 26 — Risk register

| ID | Rischio | Prob. | Impatto | Mitigazione | Owner/trigger |
|---|---|---:|---:|---|---|
| R-001 | App reale non versionata | Alta | Critico | Export e baseline prima dello sviluppo | audit owner |
| R-002 | Perdita dati Button | Media | Critico | Backup, checksum, parity e rollback | migration owner |
| R-003 | Accesso cross-tenant | Media | Critico | RLS e test automatici | security owner |
| R-004 | Payroll errato | Media | Critico | Snapshot, golden test e approvazione | finance owner |
| R-005 | Doppio job payroll | Media | Alto | Idempotency key e lock | backend owner |
| R-006 | Cataloghi hardcoded | Alta | Alto | Configurazione versionata | product owner |
| R-007 | TNT modellato sul wipe vecchio | Alta | Alto | Conferma post-wipe e campi configurabili | TNT owner |
| R-008 | Discord diventa database | Media | Alto | Source of truth nell'app | integration owner |
| R-009 | Scope eccessivo | Alta | Alto | Milestone e gate | product owner |
| R-010 | UI troppo burocratica | Media | Alto | Mobile test e regola dei tre passaggi | UX owner |
| R-011 | Permessi troppo complessi | Media | Alto | Ruoli base + scope e test matrix | security owner |
| R-012 | Modifiche economiche retroattive | Media | Alto | Lock, versioning e storni | finance owner |
| R-013 | Magazzino incoerente | Media | Alto | Movement ledger e concurrency test | inventory owner |
| R-014 | Mancanza owner operativo | Media | Alto | RACI e support ownership | governance |
| R-015 | Backup non ripristinabile | Bassa | Critico | Restore drill | security owner |
| R-016 | Dati sensibili nei log/Discord | Media | Alto | Sanitizzazione e channel policy | integration owner |
| R-017 | Dipendenza eccessiva da Supabase | Media | Medio | Adapter, export e schema standard | architecture owner |
| R-018 | Migrazione big-bang | Media | Critico | Cutover incrementale | migration owner |
| R-019 | Metriche usate per sanzioni automatiche | Media | Medio | Approvazione umana | governance |
| R-020 | Documentazione diverge dal codice | Alta | Alto | Tracciabilità e Definition of Done | tech lead |
| R-021 | Vendite duplicate | Media | Alto | Idempotenza e chiavi univoche | sales owner |
| R-022 | Sconti non autorizzati | Media | Alto | Soglie e permessi | commercial owner |
| R-023 | Prestiti senza piano/rate | Media | Medio | Campi obbligatori e alert | finance owner |
| R-024 | Evento senza rendiconto | Alta | Medio | Gate di chiusura evento | events owner |
| R-025 | Job Discord genera spam | Media | Medio | Rate limit, deduplica e preferenze | integration owner |

## Review

Il registro viene aggiornato settimanalmente durante lo sviluppo, prima di ogni gate, dopo ogni incidente, prima del go-live e dopo il pilota TNT. Ogni rischio deve avere owner, stato, data review, azione, scadenza e rischio residuo.