# 09 — Slice 1: Secure Foundation Plan

> **PIANO SOLTANTO — NON ESEGUIRE SU PRODUZIONE**

## Obiettivo

Preparare una fondazione sicura e versionata per Button's Family OS e per la futura RP Operations Suite, prima di migrare dati, creare account o sviluppare moduli business.

La Slice 1 deve eliminare la dipendenza da permessi applicati solo lato client e introdurre autenticazione reale, isolamento per organizzazione, RLS server-side, audit e rollback verificabile.

## Criteri di ingresso

La Slice 1 può iniziare solo quando:

- `E1` — B-01 è chiuso o formalmente sufficiente per l'ambiente staging;
- `E2` — Technical Owner e progetto corretto sono confermati;
- `E3` — esiste un backup verificabile della produzione;
- `E4` — staging è separato oppure è stato creato un ambiente isolato equivalente;
- `E5` — è stata approvata per iscritto l'esecuzione di migrazioni esclusivamente su staging.

Se uno dei criteri non è soddisfatto, la Slice resta `BLOCKED`.

## Vincoli non negoziabili

### ADMIN

- configura sistema, utenti, ruoli e integrazioni;
- non approva payroll per default;
- non modifica o cancella audit storici;
- non ottiene automaticamente visibilità su tutti i dati business riservati.

### DIREZIONE

- gestisce personale e attività;
- approva payroll, bonus, acquisti e operazioni economiche;
- non modifica RLS, segreti o configurazioni tecniche;
- non altera audit storici.

### STAFF

- opera soltanto sui dati propri o assegnati;
- vede soltanto il proprio prospetto e le informazioni operative necessarie;
- non vede finanza generale, stipendi altrui o note HR riservate;
- non modifica ruoli, formule paga o configurazioni aziendali.

## Work package

### 1. Snapshot dello schema

Produrre un inventario versionato di:

- tabelle e colonne;
- primary key e foreign key;
- indici e vincoli;
- enum e tipi custom;
- trigger;
- RPC e funzioni;
- RLS e policy;
- bucket e policy Storage;
- configurazione Auth rilevante;
- Edge Functions e integrazioni.

**Evidenza:** snapshot sanitizzato e commit documentale.

### 2. Backup verificato

Prima di qualunque migrazione:

- creare o confermare un backup completo secondo le capacità del piano Supabase;
- registrare timestamp e responsabile;
- verificare che il backup sia leggibile e associato al progetto corretto;
- documentare la procedura di restore;
- non dichiarare il backup valido senza una prova di restore isolata o una verifica equivalente autorizzata.

**Evidenza:** manifest backup + esito verifica.

### 3. Staging separato

Staging deve avere:

- progetto o branch database separato;
- dati demo, non dati reali non necessari;
- chiavi diverse dalla produzione;
- redirect Auth dedicati;
- configurazione esplicitamente marcata `STAGING`;
- possibilità di reset controllato.

**Divieto:** eseguire template o migrazioni sperimentali sulla produzione.

### 4. Migrazioni versionate

Ogni modifica strutturale deve essere una migrazione:

- ordinata;
- idempotente quando possibile;
- revisionabile;
- testata su staging pulito;
- accompagnata da rollback o compensazione;
- collegata a requisito e test.

Non sono ammesse modifiche manuali non registrate come stato definitivo.

### 5. Autenticazione reale

Sostituire progressivamente il login legacy/RPC applicativo con Supabase Auth o altro meccanismo server-side approvato.

Requisiti:

- account nominativi;
- sessioni revocabili;
- nessuna password nel repository;
- policy per utenti sospesi/disattivati;
- recupero account controllato;
- separazione tra identità Auth e profilo applicativo;
- mapping esplicito tra utente, personaggio, organizzazione e ruolo.

### 6. `organization_id`

Ogni record business o organizzativo deve avere ownership esplicita.

Regole:

- `organization_id` obbligatorio dove applicabile;
- foreign key verso organizzazioni;
- nessun record orfano;
- query e policy sempre scoped;
- migrazione dei dati legacy con mapping approvato;
- supporto futuro a utenti con più organizzazioni senza mescolare dati.

### 7. Ruoli MVP

Usare il template esistente:

- `database/roles_mvp_seed_template.sql`;
- `database/roles_mvp_permissions.md`.

Ruoli iniziali:

- `ADMIN`;
- `DIREZIONE`;
- `STAFF`.

Il seed deve essere eseguito solo su staging, con placeholder sostituiti in modo controllato e revisione preventiva.

### 8. Deny-by-default

Principio base:

- nessun accesso implicito;
- `anon` non legge o modifica dati business salvo endpoint pubblici esplicitamente necessari;
- ogni permesso è assegnato per ruolo, azione, organizzazione e scope;
- i permessi mancanti risultano negati;
- le eccezioni sono documentate.

### 9. RLS server-side

Le policy devono applicare almeno:

- membership attiva;
- `organization_id` coerente;
- ruolo autorizzato;
- ownership `OWN` per STAFF;
- assegnazione esplicita quando prevista;
- separazione tra lettura, inserimento, modifica e cancellazione;
- protezione dei dati HR, payroll, finanza e audit;
- divieto di escalation tramite update del proprio ruolo.

### 10. Audit append-only

Registrare eventi sensibili:

- login e revoca sessione;
- variazione ruoli e permessi;
- approvazioni economiche;
- apertura/chiusura periodi paga;
- modifiche a listini, sconti e convenzioni;
- riapertura di record approvati;
- import/export e restore;
- operazioni amministrative.

L'audit deve essere append-only e non modificabile da ADMIN o DIREZIONE tramite client.

### 11. Test RLS

Creare almeno 15 test automatici che coprano:

1. anon negato sui dati business;
2. STAFF legge i propri dati;
3. STAFF non legge dati di altro staff;
4. STAFF legge record assegnati;
5. STAFF non modifica ruoli;
6. STAFF non approva payroll;
7. DIREZIONE legge dati organizzazione;
8. DIREZIONE approva payroll;
9. DIREZIONE non modifica RLS/config tecnica;
10. ADMIN gestisce utenti/ruoli;
11. ADMIN non approva payroll per default;
12. isolamento tra organizzazioni;
13. utente sospeso negato;
14. multi-ruolo senza escalation;
15. audit non aggiornabile/cancellabile;
16. record senza `organization_id` rifiutato;
17. tentativo di spoofing ownership negato.

### 12. Dati demo isolati

Preparare dati minimi per:

- un'organizzazione Button demo;
- un account ADMIN;
- un account DIREZIONE;
- un account STAFF;
- record assegnati e non assegnati;
- un periodo payroll simulato;
- casi positivi e negativi RLS.

Credenziali e inviti restano fuori dal repository.

### 13. Rollback

Prevedere:

- feature flag o percorso che mantenga la produzione legacy invariata durante la Slice;
- reset completo dello staging;
- rollback delle migrazioni o procedura compensativa;
- ripristino da backup isolato;
- checklist go/no-go;
- responsabile autorizzato al rollback.

### 14. Criteri di ingresso operativi

Prima dell'esecuzione di ogni migrazione:

- branch corretto;
- ambiente confermato staging;
- diff revisionato;
- backup disponibile;
- nessun segreto nel commit;
- test definiti;
- rollback documentato;
- approvazione tecnica esplicita.

### 15. Criteri di uscita

La Slice 1 è completa quando:

- schema e migrazioni sono versionati;
- staging è separato e ripetibile;
- Auth reale funziona con tre account demo;
- ADMIN/DIREZIONE/STAFF rispettano la matrice;
- `organization_id` e RLS isolano correttamente i dati;
- test automatici sono verdi;
- audit append-only è verificato;
- rollback è stato provato;
- nessuna regressione è stata introdotta sulla produzione;
- evidenze e decisioni sono archiviate.

### 16. Blocker

| ID | Blocker | Impatto |
|---|---|---|
| B-01 | Owner/accesso progetto non confermati | blocca ogni audit completo e staging |
| B-02 | RLS produzione ignote | blocca valutazione rischio reale |
| B-04 | Backup/restore non verificati | blocca migrazioni |
| B-05 | Staging assente | blocca seed, Auth e test |
| B-06 | Schema/migrazioni non versionati | blocca foundation ripetibile |
| B-07 | Auth e permessi legacy solo client-side | blocca rilascio sicuro |

### 17. Evidenze richieste

- verbale chiusura B-01;
- snapshot schema sanitizzato;
- manifest backup;
- identificazione staging;
- migrazioni versionate;
- matrice ruoli applicata;
- report test RLS;
- report audit append-only;
- prova reset/rollback;
- demo registrata o checklist firmata;
- confronto produzione prima/dopo che dimostri assenza di modifiche durante la Slice.

## Sequenza consigliata

```text
B-01 chiuso
→ snapshot schema
→ backup verificato
→ staging separato
→ migrazioni foundation
→ Auth e organization_id
→ seed ruoli
→ RLS deny-by-default
→ audit append-only
→ dati demo
→ test RLS
→ prova rollback
→ gate Slice 1
```

## Stop condition

Fermarsi immediatamente se:

- l'ambiente non è chiaramente staging;
- il backup non è disponibile;
- vengono richieste credenziali in chiaro;
- una migrazione coinvolge produzione senza approvazione separata;
- un test può leggere o modificare dati reali;
- le policy producono accesso cross-organization;
- il rollback non è dimostrabile.
