# 19 — Master roadmap

## Regola dei gate

Ogni fase termina solo quando deliverable, criteri di uscita, rischi, test ed evidenze sono aggiornati e il responsabile autorizzato approva il passaggio. Nessun gate autorizza automaticamente merge, deploy o modifica a Supabase.

## Fase 0 — Protezione della baseline

**Obiettivo:** rendere Button ripristinabile prima di qualsiasi modifica.

Deliverable:
- snapshot repository e produzione;
- export app e asset;
- schema Supabase;
- inventario segreti e dipendenze;
- backup;
- test baseline;
- rollback runbook.

Gate:
- baseline riproducibile;
- restore provato in ambiente isolato;
- produzione invariata durante l'audit.

## Fase 1 — Discovery completa

Deliverable:
- inventario funzioni Button;
- inventario manuali e materiali Discord TNT;
- glossario canonico;
- mappa requisiti esistenti/richiesti/futuri;
- dati sensibili;
- open questions.

Gate:
- nessun requisito critico vive soltanto in chat, Discord o memoria personale.

## Fase 2 — Architettura e domini

Deliverable:
- Shared Core;
- Organization OS;
- Business Operations OS;
- vertical packs;
- confini e ownership;
- ADR iniziali;
- strategia configurazione e white-label.

Gate:
- ogni funzione ha dominio, responsabile, priorità e dipendenze.

## Fase 3 — Data model e sicurezza

Deliverable:
- ERD;
- tabelle e relazioni;
- stati;
- invarianti;
- RLS matrix;
- retention;
- strategia migrazioni;
- modello audit.

Gate:
- schema e permessi revisionati prima della UI.

## Fase 4 — Fondazione tecnica

Deliverable:
- codebase applicativa versionata;
- autenticazione;
- tenant isolation;
- ambienti development/staging;
- CI;
- audit;
- feature flags;
- dati seed;
- osservabilità.

Gate:
- accessi testati e staging funzionante senza dati di produzione non autorizzati.

## Fase 5 — Migrazione Button

Deliverable:
- adapter/import;
- parity checklist;
- manuali collegati;
- gestione wipe;
- regression suite;
- report migrazione;
- rollback.

Gate:
- Button uguale o migliore rispetto alla baseline, senza perdita di dati o funzioni.

## Fase 6 — Business Core MVP

Deliverable:
- personale e onboarding;
- turni;
- clienti e fornitori;
- catalogo e listini;
- preventivi e ordini di lavoro;
- vendite e pagamenti;
- acquisti e ricezioni;
- magazzino;
- cassa;
- procedure e formazione.

Gate:
- un business generico è gestibile end-to-end senza moduli verticali.

## Fase 7 — Payroll MVP

Deliverable:
- contratti;
- formule fisse, percentuali, a prestazione e miste;
- periodi;
- scheduler;
- simulazione;
- approvazione;
- pagamento;
- contestazione;
- audit e export.

Gate:
- ogni compenso è riproducibile, spiegabile e bloccato dopo approvazione.

## Fase 8 — TNT Automotive Pilot

Deliverable:
- cliente e veicolo;
- diagnosi e preventivo;
- assegnazioni e ricambi;
- lavorazione;
- controllo qualità;
- consegna e incasso;
- storico veicolo;
- formazione apprendisti;
- dashboard officina.

Gate:
- una settimana operativa completa è gestita con utenti pilota e dati coerenti.

## Fase 9 — Finanza avanzata

Deliverable:
- budget;
- cash flow;
- crediti/debiti;
- prestiti e rate;
- investimenti;
- imprevisti;
- scadenziario;
- report direzionali.

Gate:
- la direzione legge disponibilità, risultato e impegni futuri.

## Fase 10 — Eventi, sponsor e marketing

Deliverable:
- eventi;
- staff e partner;
- budget/consuntivo;
- sponsor;
- campagne;
- convenzioni;
- KPI.

Gate:
- evento completo dalla proposta al rendiconto finale.

## Fase 11 — Discord integration

Deliverable:
- mapping canali;
- notification rules;
- delivery queue;
- adapter;
- retry/idempotenza;
- comandi read-only;
- log consegna.

Gate:
- ogni notifica rimanda a un record autorizzato dell'app e nessun dato critico vive solo su Discord.

## Fase 12 — QA e rilascio

Deliverable:
- unit, integration, RLS, E2E e UAT;
- security review;
- backup/restore;
- performance;
- release notes;
- rollback drill;
- support plan.

Gate:
- checklist 100%, nessun blocker P0/P1, go-live approvato.

## Fase 13 — Productizzazione

Deliverable:
- template hospitality/casinò/custom;
- onboarding guidato;
- configuratore;
- white-label;
- packaging;
- analytics;
- documentazione commerciale.

Gate:
- una nuova organizzazione viene creata senza fork del codice.

## Dipendenze principali

```text
F0 → F1 → F2 → F3 → F4
F4 → F5 Button parity
F4 → F6 Business Core
F6 + Finance/Sales → F7 Payroll
F6 + F7 → F8 TNT Pilot
F8 → F9/F10
Core stabile → F11 Discord
Tutte le fasi → F12 QA trasversale
Validazione pilota → F13 Productizzazione
```