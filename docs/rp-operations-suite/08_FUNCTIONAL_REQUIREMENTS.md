# 08 — Functional requirements

## Convenzioni

- `FR-CORE-*`: nucleo condiviso.
- `FR-AUTH-*`: utenti, ruoli e autorizzazioni.
- `FR-ORG-*`: Organization OS.
- `FR-BUS-*`: Business OS.
- `FR-PAY-*`: payroll.
- `FR-FIN-*`: finanza.
- `FR-TNT-*`: pilota automotive.
- `NFR-*`: requisiti non funzionali.

## Shared Core

- **FR-CORE-001** — Creare e gestire più organizzazioni.
- **FR-CORE-002** — Associare utenti, personaggi e membership.
- **FR-CORE-003** — Gestire ruoli e permessi per organizzazione.
- **FR-CORE-004** — Gestire sedi, server, wipe e stagioni.
- **FR-CORE-005** — Versionare configurazioni e cataloghi.
- **FR-CORE-006** — Allegare documenti e media.
- **FR-CORE-007** — Registrare audit per azioni sensibili.
- **FR-CORE-008** — Cercare, filtrare ed esportare dati autorizzati.
- **FR-CORE-009** — Archiviare senza cancellare lo storico.
- **FR-CORE-010** — Inviare notifiche configurabili.

## Utenti e autorizzazioni

- **FR-AUTH-001** — L'MVP deve supportare i profili `ADMIN`, `DIREZIONE` e `STAFF`.
- **FR-AUTH-002** — Admin deve poter gestire utenti, ruoli, configurazioni, integrazioni e supporto tecnico nel proprio perimetro.
- **FR-AUTH-003** — Direzione deve poter governare personale, attività, finanza, payroll e approvazioni aziendali.
- **FR-AUTH-004** — Staff deve poter operare sui record propri o assegnati e consultare soltanto i propri dati personali/economici.
- **FR-AUTH-005** — Admin senza ruolo Direzione non deve approvare payroll o movimenti economici sensibili.
- **FR-AUTH-006** — Direzione senza ruolo Admin non deve modificare segreti, policy RLS o audit.
- **FR-AUTH-007** — Le azioni sopra soglia e l'auto-approvazione devono richiedere una seconda approvazione configurabile.
- **FR-AUTH-008** — I tentativi di accesso negati devono essere verificabili senza esporre dati riservati.
- **FR-AUTH-009** — Staging deve prevedere gli alias `demo-admin`, `demo-direzione` e `demo-staff`, con credenziali conservate fuori dal repository.
- **FR-AUTH-010** — Una persona può avere più ruoli, ma ogni azione deve registrare il ruolo e lo scope utilizzati.

## Business

- **FR-BUS-001** — Gestire personale, onboarding e stati.
- **FR-BUS-002** — Gestire turni e disponibilità.
- **FR-BUS-003** — Gestire clienti e segmenti.
- **FR-BUS-004** — Gestire fornitori.
- **FR-BUS-005** — Gestire servizi, prodotti e listini.
- **FR-BUS-006** — Creare preventivi e ordini di lavoro.
- **FR-BUS-007** — Registrare vendite, sconti e pagamenti.
- **FR-BUS-008** — Registrare acquisti e ricezioni.
- **FR-BUS-009** — Gestire giacenze e inventari.
- **FR-BUS-010** — Gestire cassa, conti e movimenti.
- **FR-BUS-011** — Gestire procedure e formazione.
- **FR-BUS-012** — Calcolare KPI e report.
- **FR-BUS-013** — Gestire eventi e manifestazioni.
- **FR-BUS-014** — Gestire sponsor e campagne.
- **FR-BUS-015** — Gestire investimenti, prestiti e imprevisti.

## Payroll

- **FR-PAY-001** — Contratto fisso.
- **FR-PAY-002** — Percentuale fatturato personale.
- **FR-PAY-003** — Percentuale fatturato aziendale.
- **FR-PAY-004** — Compenso per servizio/turno.
- **FR-PAY-005** — Formula ibrida.
- **FR-PAY-006** — Bonus, premi e benefit.
- **FR-PAY-007** — Periodicità configurabile.
- **FR-PAY-008** — Calcolo schedulato idempotente.
- **FR-PAY-009** — Simulazione prima della chiusura.
- **FR-PAY-010** — Revisione e approvazione.
- **FR-PAY-011** — Pagamento e quietanza RP.
- **FR-PAY-012** — Contestazione e rettifica versionata.
- **FR-PAY-013** — Blocco del periodo approvato.
- **FR-PAY-014** — Spiegazione riga per riga del calcolo.

## TNT

- **FR-TNT-001** — Registrare cliente e veicolo.
- **FR-TNT-002** — Creare diagnosi e preventivo.
- **FR-TNT-003** — Assegnare meccanici e ricambi.
- **FR-TNT-004** — Tracciare stato lavorazione.
- **FR-TNT-005** — Eseguire controllo qualità.
- **FR-TNT-006** — Registrare consegna e incasso.
- **FR-TNT-007** — Consultare storico veicolo.
- **FR-TNT-008** — Tracciare formazione apprendisti.
- **FR-TNT-009** — Collegare lavori a fatturato personale.
- **FR-TNT-010** — Gestire eventi automotive.

## Non funzionali

- **NFR-001** — Mobile-first.
- **NFR-002** — RLS e autorizzazione server-side.
- **NFR-003** — Audit immutabile per azioni sensibili.
- **NFR-004** — Backup e restore verificati.
- **NFR-005** — Performance adeguata a crescita pluriennale.
- **NFR-006** — Accessibilità di base WCAG.
- **NFR-007** — Job automatici idempotenti.
- **NFR-008** — Nessun segreto nel repository.
- **NFR-009** — Migrazioni reversibili quando possibile.
- **NFR-010** — Osservabilità e log sanitizzati.