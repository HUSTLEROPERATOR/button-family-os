# 19 — Master roadmap

## Scopo

Questa roadmap trasforma il blueprint in un percorso eseguibile. Distingue il **cammino critico**, il lavoro parallelo, il perimetro MVP e le evidenze richieste per superare ogni gate.

Nessun gate autorizza automaticamente merge, deploy, modifica a Supabase o pubblicazione. Queste azioni richiedono sempre un'approvazione esplicita separata.

## Regole operative

1. **Audit prima dello sviluppo:** non si riscrive ciò che non è stato recuperato e verificato.
2. **Vertical slice prima dell'espansione:** si valida un flusso completo prima di moltiplicare moduli e schermate.
3. **Button parity protetta:** Button's Family OS non perde funzioni durante l'evoluzione.
4. **Configurazione prima del custom code:** servizi, prezzi, formule, ruoli e wipe devono essere dati versionati.
5. **QA trasversale:** test, sicurezza, backup e documentazione iniziano dalla Fase 0, non dalla Fase 12.
6. **Una sola fonte ufficiale:** GitHub per codice e decisioni; database per dati; Discord per comunicazioni.
7. **Evidenza obbligatoria:** nessuna fase è completata senza output verificabile.

## Workstream paralleli

| Workstream | Contenuto | Owner di ruolo |
|---|---|---|
| A — Governance e prodotto | scope, decisioni, priorità, approvazioni | Product Owner |
| B — Baseline e migrazione | recupero Button, backup, import, parity | Migration Owner |
| C — Platform e sicurezza | codebase, DB, Auth, RLS, audit, ambienti | Technical/Security Owner |
| D — Business e TNT | processi, UI, cataloghi, payroll, pilota | Business/TNT Owner |
| E — QA e release | test, UAT, runbook, monitoraggio, rollback | QA/Release Owner |

I workstream possono procedere in parallelo soltanto quando non anticipano un gate bloccante.

## MVP cut line

### Dentro l'MVP

- baseline Button recuperata, versionata e ripristinabile;
- login, organizzazioni, membership, ruoli, permessi e audit;
- gestione wipe/stagioni;
- Button parity;
- un flusso business completo: cliente → ordine di lavoro → vendita → pagamento → cassa;
- acquisti e magazzino minimi collegati al lavoro;
- personale, onboarding e turni essenziali;
- payroll con fisso, percentuale personale, formula ibrida, bonus e approvazione;
- TNT Automotive pilot per una settimana operativa;
- test, backup, restore e rollback.

### Fuori dall'MVP, prima della validazione TNT

- template hospitality e casinò completi;
- white-label avanzato;
- scritture economiche da Discord;
- pagamenti automatici senza approvazione;
- analytics predittivi;
- investimenti e prestiti avanzati non necessari al pilota;
- marketplace di template;
- integrazioni dirette con script server non confermati.

## Milestone e stato iniziale

| Milestone | Risultato | Stato iniziale |
|---|---|---|
| M0 | Baseline protetta | IN_PROGRESS — accesso sorgente/Supabase da verificare |
| M1 | Architettura approvata | IN_REVIEW — blueprint presente |
| M2 | Foundation pronta | NOT_STARTED |
| M3 | Button parity | NOT_STARTED |
| M4 | Business vertical slice/Core | NOT_STARTED |
| M5 | Payroll | NOT_STARTED |
| M6 | TNT Pilot | NOT_STARTED |
| M7 | Advanced Operations | NOT_STARTED |
| M8 | Discord | NOT_STARTED |
| M9 | Production | NOT_STARTED |
| M10 | Productizzazione | NOT_STARTED |

## Fase 0 — Protezione della baseline

**Obiettivo:** rendere Button ripristinabile prima di qualsiasi modifica applicativa.

### Input

- repository `button-family-os`;
- loader live;
- accesso al progetto Supabase effettivamente usato;
- materiali e manuali disponibili.

### Deliverable

- snapshot repository e versione live;
- export completo dell'app e degli asset;
- hash della baseline;
- inventario schema Supabase: tabelle, viste, funzioni, trigger, RLS e storage;
- inventario segreti e dipendenze senza segreti nel repo;
- backup database e storage;
- test baseline Button;
- rollback runbook;
- ownership tecnica e operativa.

### Evidenze

- commit/tag di baseline;
- report conteggi e hash;
- report backup;
- esito restore isolato;
- checklist funzionale Button firmata.

### Gate M0

- baseline riproducibile;
- restore provato in ambiente isolato;
- accesso al progetto Button confermato;
- produzione invariata durante l'audit;
- nessun dato o funzione critica non localizzata.

### Stop condition

Se codice reale, schema o backup non sono recuperabili, lo sviluppo si ferma: non si ricostruisce per supposizione.

## Fase 1 — Discovery completa

**Obiettivo:** portare requisiti e conoscenza operativa fuori da chat, Discord e memoria personale.

### Deliverable

- inventario funzioni Button;
- inventario manuali Button e template;
- inventario materiali Discord TNT;
- glossario canonico;
- mappa requisito: esistente, approvato, aperto, futuro;
- user journey per direzione, responsabile, dipendente e apprendista;
- dati sensibili e livelli di visibilità;
- open questions classificate per priorità e milestone;
- mappa dei processi post-wipe da confermare.

### Evidenze

- matrice requisito-fonte;
- journey map;
- lista duplicati e conflitti;
- decision queue ordinata.

### Gate

- nessun requisito P0/P1 vive soltanto in chat, Discord o memoria;
- ogni requisito P0/P1 ha owner, task, test previsto e milestone.

## Fase 2 — Architettura e domini

**Obiettivo:** approvare la struttura del prodotto prima di scegliere dettagli implementativi irreversibili.

### Deliverable

- Shared Core;
- Organization OS;
- Business Operations OS;
- vertical packs;
- confini e ownership;
- strategia repository;
- strategia configurazione/cataloghi;
- strategia white-label;
- eventi di dominio;
- ADR iniziali;
- decisione su ambienti e integrazioni.

### Gate M1

- ogni funzione ha dominio, owner, priorità e dipendenze;
- repo target e strategia legacy sono approvati;
- MVP cut line congelata;
- nessuna decisione P0 aperta blocca il data model.

## Fase 3 — Data model e sicurezza

**Obiettivo:** definire dati e autorizzazioni prima della UI.

### Deliverable

- ERD Shared Core, Organization OS e Business OS;
- tabelle, relazioni e indici;
- stati e transizioni;
- invarianti economiche;
- precisione monetaria, valuta e arrotondamenti;
- timezone organizzazione;
- RLS matrix;
- retention e archiviazione;
- strategia migrazioni;
- audit model;
- import/export contract;
- seed sintetici.

### Gate

- schema revisionato;
- RLS deny-by-default definita;
- record economici e payroll versionabili;
- nessuna UI parte senza contratto dati e permessi.

## Fase 4 — Fondazione tecnica

**Obiettivo:** creare una piattaforma sicura, testabile e separata dalla produzione legacy.

### Deliverable

- codebase applicativa versionata;
- ambienti development e staging;
- autenticazione;
- tenant isolation;
- membership, ruoli e permessi;
- audit log;
- migrazioni e seed;
- CI;
- feature flags;
- osservabilità;
- error handling;
- backup e restore per l'ambiente nuovo.

### Vertical slice tecnica

Login → selezione organizzazione → record autorizzato → audit → test RLS.

### Gate M2

- accessi e isolamento testati;
- staging funzionante;
- CI verde;
- nessun dato di produzione non autorizzato;
- rollback della foundation documentato.

## Fase 5 — Migrazione Button

**Obiettivo:** portare Button nella foundation senza regressioni.

### Deliverable

- mapping origine-destinazione;
- adapter/import idempotente;
- report record importati/scartati/duplicati;
- parity checklist;
- manuali e procedure collegati;
- wipe/stagioni;
- regression suite;
- UAT Button;
- rollback.

### Gate M3

- Button uguale o migliore rispetto alla baseline;
- zero perdita dati confermata;
- permessi equivalenti o più sicuri;
- UAT approvata;
- legacy mantenuto ripristinabile finché non termina il periodo di stabilità.

## Fase 6 — Business Core MVP

**Obiettivo:** validare prima un flusso commerciale completo, poi espandere il dominio.

### Gate interno 6A — Vertical slice business

Cliente → preventivo → ordine di lavoro → assegnazione → vendita → pagamento → movimento cassa → audit.

Condizioni:
- funzionamento mobile;
- permessi testati;
- nessun doppio pagamento;
- stato e storico coerenti;
- dati di esempio riproducibili.

### Gate interno 6B — Espansione core

- personale e onboarding;
- turni;
- fornitori;
- catalogo e listini versionati;
- acquisti e ricezioni;
- magazzino e inventario;
- procedure e formazione;
- report essenziali.

### Gate M4

- un business generico è gestibile end-to-end;
- le variazioni di servizi e prezzi non richiedono codice;
- vendite, cassa e magazzino sono riconciliabili;
- operazioni frequenti sono completabili da smartphone.

## Fase 7 — Payroll MVP

**Obiettivo:** produrre un prospetto stipendiale spiegabile e approvabile.

### Gate interno 7A — Motore deterministico

- contratto fisso;
- percentuale fatturato personale;
- formula ibrida;
- bonus/premi;
- snapshot regole;
- golden tests;
- spiegazione riga per riga.

### Gate interno 7B — Ciclo operativo

- periodicità configurabile;
- scheduler idempotente;
- simulazione;
- freeze;
- review;
- approvazione;
- pagamento;
- rettifica e contestazione;
- export.

Il supporto alla quota di fatturato aziendale resta nel modello, ma può essere disattivato nel primo pilot se la regola di distribuzione non è approvata.

### Gate M5

- stesso input e stessa versione regole producono lo stesso risultato;
- ogni cifra è spiegabile;
- nessun doppio calcolo;
- periodo approvato bloccato;
- riapertura solo con audit e nuova versione.

## Fase 8 — TNT Automotive Pilot

**Obiettivo:** validare Business Core e Payroll in una settimana operativa reale.

### Deliverable

- cliente e veicolo;
- accettazione, diagnosi e preventivo;
- assegnazioni e ricambi;
- lavorazione e controllo qualità;
- consegna e incasso;
- storico veicolo;
- formazione apprendisti;
- dashboard officina;
- payroll pilota;
- report anomalie e feedback.

### Gate M6

- settimana completa gestita nel sistema;
- dati coerenti e riconciliati;
- payroll verificato dalla direzione;
- nessun blocker P0/P1;
- feedback classificato in bug, miglioramento e richiesta futura;
- decisione go/no-go per estensioni avanzate.

## Fase 9 — Finanza avanzata

### Deliverable

Budget, cash flow, crediti/debiti, prestiti e rate, investimenti, imprevisti, scadenziario e report direzionali.

### Gate M7A

La direzione legge disponibilità, risultato e impegni futuri; ogni movimento avanzato è collegato a una fonte e a un'approvazione.

## Fase 10 — Eventi, sponsor e marketing

### Deliverable

Eventi, staff e partner, budget/consuntivo, sponsor, campagne, convenzioni e KPI.

### Gate M7B

Un evento è gestito dalla proposta al rendiconto finale, inclusi obblighi sponsor, costi e risultati.

## Fase 11 — Discord integration

### Deliverable

Mapping canali, notification rules, delivery queue, adapter, retry/idempotenza, comandi read-only e log consegna.

### Gate M8

Ogni notifica rimanda a un record autorizzato dell'app; nessun dato critico vive soltanto su Discord; il bot può essere disattivato senza bloccare l'app.

## Fase 12 — Hardening e rilascio

Questa fase raccoglie i gate finali, ma QA e sicurezza sono attivi dalla Fase 0.

### Deliverable

- unit, integration, RLS, E2E e UAT;
- security review;
- performance;
- backup/restore drill;
- migration dry-run;
- release notes;
- rollback drill;
- support e incident plan;
- monitoraggio post-release.

### Gate M9

- checklist release al 100%;
- nessun blocker P0/P1;
- UAT Button e TNT approvate;
- backup e rollback provati;
- go-live autorizzato esplicitamente.

## Fase 13 — Productizzazione

### Deliverable

Template hospitality/casinò/custom, onboarding guidato, configuratore, white-label, packaging, analytics, documentazione commerciale e support model.

### Gate M10

Una nuova organizzazione viene creata e configurata senza fork del codice e senza accesso tecnico al database.

## Cammino critico

```text
F0 Baseline
→ F1 Discovery
→ F2 Architettura
→ F3 Data/Security
→ F4 Foundation
→ F5 Button parity
→ F6 Business vertical slice/Core
→ F7 Payroll
→ F8 TNT Pilot
→ F12 Release
```

F9, F10 e F11 non devono bloccare l'MVP salvo requisiti confermati dal pilota.

## Lavoro parallelizzabile

- manuali e procedure durante F0-F3;
- UX journey e wireframe dopo la discovery, senza anticipare schema e permessi;
- golden dataset payroll durante F3-F6;
- materiali TNT e cataloghi demo durante F4-F6;
- test e sicurezza durante tutte le fasi;
- marketing/productizzazione solo dopo evidenze del pilota.

## Regola di stima

Prima della chiusura F0-F1 non si comunicano date definitive. Ogni fase riceve:

- effort `S/M/L/XL`;
- confidence `LOW/MEDIUM/HIGH`;
- dipendenze;
- owner;
- capacità disponibile;
- buffer per audit, migrazione e UAT.

Le stime vengono aggiornate a ogni gate, non presentate come promesse immutabili.