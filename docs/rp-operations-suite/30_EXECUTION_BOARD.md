# 30 — Execution board

## Scopo

Il Master Todo è il catalogo completo. Questo documento contiene solo il lavoro realmente eseguibile nel prossimo passaggio, con stato, dipendenze ed evidenze. Evita di trasformare il backlog in una massa indistinta.

## Stato attuale verificato

- Blueprint documentale presente su branch dedicato.
- Draft PR aperta.
- Nessuna modifica applicativa, Supabase o deploy.
- Domini Button/Organization OS e Business Operations OS definiti.
- Roadmap, requisiti, data model preliminare, risk register e test plan presenti.
- Modello utenti iniziale approvato: `ADMIN`, `DIREZIONE`, `STAFF`.
- Separazione Admin/Direzione e visibilità Staff documentate.
- `GTA RP Manuale Operativo Bozza v1.0` registrato come `SOURCE_DRAFT`.
- Manuale mappato a moduli, requisiti, entità, task, test e decisioni aperte.
- Le soglie numeriche della bozza sono inattive e devono essere approvate per stagione.
- Accesso al codice completo e al progetto Supabase effettivo di Button ancora da verificare.
- Processi TNT definitivi dipendono dal prossimo wipe.

## Regole board

- massimo 3 task `IN_PROGRESS` contemporaneamente;
- ogni task ha un solo accountable owner;
- i task bloccati non entrano nel WIP;
- nessun task P0 viene chiuso senza evidenza;
- le issue GitHub si creano solo per task `READY` o `IN_PROGRESS`;
- nessuna issue autorizza merge, deploy o modifica a produzione;
- nessuna regola proveniente da `SOURCE_DRAFT` può diventare attiva durante l'audit.

## Execution Pack 0 — Governance e accessi

| Ordine | ID | Task | Stato | Owner di ruolo | Dipendenza | Evidenza richiesta |
|---:|---|---|---|---|---|---|
| 1 | AUTH-000 | Definire profili Admin/Direzione/Staff | DONE | Product/Security | — | decision log + permission matrix |
| 2 | GOV-001 | Formalizzare Product Owner | READY | Product Owner | — | decision log aggiornato |
| 3 | GOV-002 | Nominare Technical Owner | NEEDS_CLARIFICATION | Product Owner | — | nome/ruolo e responsabilità |
| 4 | GOV-003 | Nominare owner Button e TNT | READY | Product Owner | — | RACI iniziale |
| 5 | GOV-004 | Definire RACI minima | READY | Product Owner | GOV-001..003 | tabella approvata |
| 6 | GOV-005 | Completare soglie e doppia approvazione | IN_REVIEW | Product + Finance/Security | AUTH-000, GOV-004 | matrice azione/approvatore |
| 7 | Q-TECH-002 | Verificare accesso al progetto Supabase Button | BLOCKED | Technical Owner | GOV-002 | progetto identificato e accessibile |
| 8 | Q-TECH-003 | Approvare strategia repository | READY | Product + Technical | GOV-002 | ADR/repo decision |

### Gate Pack 0

- profili e permessi iniziali approvati;
- owner nominati;
- accesso tecnico verificato;
- RACI e soglie approvate;
- repository target deciso;
- nessuna credenziale inserita nel repo.

## Execution Pack 1 — Baseline Button

| Ordine | ID | Task | Stato | Owner di ruolo | Dipendenza | Evidenza richiesta |
|---:|---|---|---|---|---|---|
| 1 | AUD-001 | Snapshot `main` e versione live | READY | Migration Owner | Pack 0 | commit, URL/versione, data |
| 2 | AUD-002 | Esportare app servita da Supabase | BLOCKED | Technical/Migration | accesso Supabase | file sorgente + hash |
| 3 | AUD-003 | Calcolare hash baseline | BLOCKED | Migration Owner | AUD-002 | checksum report |
| 4 | AUD-004 | Inventariare asset | BLOCKED | Migration Owner | AUD-002 | manifest asset |
| 5 | AUD-005 | Inventariare dipendenze/licenze | BLOCKED | Technical Owner | AUD-002 | dependency report |
| 6 | AUD-006 | Inventariare schema DB | BLOCKED | Data Owner | accesso Supabase | schema report |
| 7 | AUD-007 | Inventariare RLS e ruoli esistenti | BLOCKED | Security Owner | AUD-006 | permission matrix legacy |
| 8 | AUD-008 | Mappare segreti e variabili | BLOCKED | Security Owner | accesso ambienti | inventory senza valori segreti |
| 9 | AUD-009 | Backup DB e storage | BLOCKED | Technical Owner | accesso Supabase | backup report |
| 10 | AUD-010 | Restore isolato | BLOCKED | Technical/QA | AUD-009 | restore evidence |
| 11 | AUD-011 | Baseline funzionale Button | BLOCKED | Button Owner | AUD-002 | parity checklist |
| 12 | ORG-001 | Inventario parity Button | BLOCKED | Button Owner | AUD-011 | funzione/schermata/stato |
| 13 | ORG-023 | Confrontare app Button e Manuale Operativo | BLOCKED | Button/Product | AUD-002/011 | parity source report |

### Gate Pack 1 / M0

- codice reale versionato;
- schema, utenti legacy e asset inventariati;
- backup e restore verificati;
- parity Button documentata;
- confronto app/manuale completato;
- rollback eseguibile.

## Execution Pack 2 — Knowledge discovery

Questo pacchetto può procedere in parallelo a Pack 1 senza toccare produzione.

| Ordine | ID | Task | Stato | Owner di ruolo | Dipendenza | Evidenza richiesta |
|---:|---|---|---|---|---|---|
| 1 | AUD-013 | Inventariare manuali e materiali Discord | IN_PROGRESS | Product/Content Owner | — | source register |
| 2 | ORG-011 | Registrare Manuale Operativo GTA RP | DONE | Product/Content | — | documento 33 + audit |
| 3 | ORG-021 | Collegare fonte, requisiti, task e test | IN_REVIEW | Product/Data | ORG-011 | traceability matrix |
| 4 | ORG-024 | Classificare regole observed/proposed/approved/deferred | READY | Product/Button | ORG-023 parziale | rule register |
| 5 | AUD-014 | Classificare requisiti | IN_PROGRESS | Product Owner | AUD-013/ORG-011 | requirement-source matrix |
| 6 | ARCH-001 | Confermare domini e confini | DONE | Product Owner | — | blueprint/decision log |
| 7 | ARCH-004 | Strategia configurazioni | IN_REVIEW | Product/Technical | AUD-014 | config principles |
| 8 | ARCH-005 | Cataloghi versionati | IN_REVIEW | Product/Data | ARCH-004 | catalog contract |
| 9 | Q-BTN-001 | Definire baseline obbligatoria Button | BLOCKED | Button Owner | AUD-011 | approved list |
| 10 | Q-BTN-002 | Definire dati da migrare | BLOCKED | Button/Data Owner | AUD-006/011 | migration scope |
| 11 | Q-MAN-001..013 | Deliberare proposte del manuale | READY/PARTIAL_BLOCK | Direzione | parity + wipe | decision queue |
| 12 | Q-TNT-001 | Confermare processi post-wipe | DEFERRED | TNT Owner | nuovo wipe | process map approvata |

## Execution Pack 3 — Architettura approvabile

Parte solo dopo M0, salvo bozze non vincolanti.

| Ordine | ID | Task | Stato | Owner di ruolo | Dipendenza | Evidenza richiesta |
|---:|---|---|---|---|---|---|
| 1 | ARCH-002 | Multi-tenancy | NOT_READY | Technical/Data | M0 | ADR + test strategy |
| 2 | ARCH-003 | Organizzazioni/sedi/reparti | NOT_READY | Product/Data | discovery | domain model |
| 3 | ARCH-007 | Ambienti | NOT_READY | Technical Owner | repo strategy | environment plan |
| 4 | DATA-001 | ERD Shared Core | NOT_READY | Data Owner | ARCH-002/003 | ERD reviewed |
| 5 | DATA-002 | ERD Organization OS | IN_REVIEW | Data/Button Owner | manual mapping + parity | ERD reviewed |
| 6 | DATA-003 | ERD Business OS | NOT_READY | Data/Business Owner | AUD-014 | ERD reviewed |
| 7 | DATA-005 | Invarianti economiche | NOT_READY | Finance/Data | payroll decisions | invariant catalog |
| 8 | AUTH-001 | Modellare ruoli Admin/Direzione/Staff | READY | Security/Data | AUTH-000, M0 | role/permission schema |
| 9 | AUTH-004 | Disegnare RLS deny-by-default | NOT_READY | Security Owner | AUTH-001, DATA-001 | RLS matrix |
| 10 | AUTH-010 | Separazione dei compiti | IN_REVIEW | Security/Finance | GOV-005 | approval matrix |
| 11 | ORG-020 | Configuration approval register | READY | Product/Data | DATA-002 | approval schema |
| 12 | ORG-043/044/045 | Seed inattivi e protezione regole bozza | READY | Data/Security | ORG-020 | seed template + tests |
| 13 | SEC-001 | Threat model | NOT_READY | Security Owner | architecture draft | threat model |

## Profili staging da creare in Slice 1

| Alias | Ruolo | Stato |
|---|---|---|
| `demo-admin` | ADMIN | SPECIFIED — non ancora creato |
| `demo-direzione` | DIREZIONE | SPECIFIED — non ancora creato |
| `demo-staff` | STAFF | SPECIFIED — non ancora creato |

Gli account vengono creati soltanto nell'ambiente staging, dopo accesso al progetto corretto e approvazione della foundation. Nessuna password viene salvata su GitHub.

## MVP priority queue

### Must — prima del pilota TNT

- M0 baseline protetta;
- M1 architettura approvata;
- Auth, organization, ruoli Admin/Direzione/Staff, RLS e audit;
- Button parity;
- manuale operativo classificato e configurazioni inattive;
- onboarding/tutor, activity ledger, mission/debrief e issue register essenziali;
- cliente, preventivo, ordine di lavoro, vendita, pagamento e cassa;
- acquisti/magazzino essenziali;
- payroll deterministico e approvabile;
- TNT settimana pilota;
- backup, restore e rollback.

### Should — entra solo se non mette a rischio Must

- intelligence avanzata;
- turni avanzati;
- formazione completa;
- convenzioni;
- dashboard KPI estesa;
- eventi automotive base;
- report esportabili.

### Later

- quote/cauzioni non approvate;
- target numerici non approvati;
- ruoli specializzati HR/Finance/Responsabile/Auditor;
- finanza avanzata;
- sponsor e marketing completi;
- prestiti complessi;
- scritture da Discord;
- hospitality/casinò;
- white-label avanzato;
- analytics predittivi.

## Evidenza minima per task

Un link o artefatto verificabile tra commit/PR, report audit, screenshot/demo, query/test result, schema/ERD, decision log, export/checksum, UAT o runbook eseguito.

`DONE` senza evidenza non è ammesso.

## Prossimo checkpoint

Il checkpoint successivo deve produrre:

1. owner e RACI;
2. esito accesso Supabase Button;
3. strategia repository;
4. snapshot baseline;
5. lista delle funzioni Button da proteggere;
6. parity iniziale app/manuale;
7. elenco delle proposte del manuale da approvare, modificare, eliminare o rinviare;
8. decisione se Pack 1 può partire o resta bloccato.

La definizione dei tre profili iniziali e l'integrazione semantica del manuale sono completate; account reali e regole attive restano bloccati fino allo staging corretto e alle approvazioni.