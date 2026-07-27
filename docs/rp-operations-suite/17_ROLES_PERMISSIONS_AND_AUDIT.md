# 17 — Roles, permissions and audit

## Modello MVP

La prima implementazione utilizza tre profili:

- `ADMIN` — configurazione tecnica, utenti, ruoli, integrazioni e supporto;
- `DIREZIONE` — governo operativo, economico e del personale;
- `STAFF` — attività quotidiane e accesso ai propri dati.

La matrice completa è definita in `32_INITIAL_USERS_AND_PERMISSION_MATRIX.md`.

## Modello RBAC + scope

Il permesso effettivo deriva da:

```text
organizzazione
+ ruolo
+ sede/reparto
+ stagione
+ ownership o assegnazione del record
+ soglia economica
+ eventuale delega temporanea
```

La UI non è un controllo di sicurezza sufficiente: ogni permesso deve essere applicato lato backend/RLS.

## Separazione ADMIN / DIREZIONE

`ADMIN` e `DIREZIONE` sono intenzionalmente distinti.

- Admin può configurare il sistema, ma non approva automaticamente payroll o operazioni economiche.
- Direzione può approvare operazioni aziendali, ma non modifica segreti, RLS o audit.
- Una persona può ricevere entrambi i ruoli, ma le azioni restano auditabili e soggette alle regole di doppia approvazione.

## STAFF

Lo Staff opera per ownership, assegnazione e soglia. Può registrare lavori, vendite, pagamenti e richieste consentite, ma vede solo i dati necessari alla propria attività e i propri risultati.

## Azioni sensibili

- assegnazione/rimozione Admin;
- modifica ruoli e permessi;
- accesso o export finanziario completo;
- modifica formule stipendiali;
- approvazione o riapertura payroll;
- rettifica inventario;
- sconti, bonus, acquisti o prestiti sopra soglia;
- cancellazione/archiviazione;
- restore;
- configurazione integrazioni e segreti.

## Separazione dei compiti

- chi crea un movimento sensibile non lo approva da solo sopra soglia;
- Admin tecnico non approva payroll per default;
- Direzione non modifica RLS o segreti;
- chi prepara payroll non approva il proprio prospetto;
- chi registra una rettifica inventario richiede approvazione quando supera soglia;
- chi crea un prestito non ne conferma il pagamento senza controllo;
- nessun ruolo può cancellare l'audit.

## Audit event

Campi minimi:

- attore e ruoli attivi;
- organizzazione, sede e stagione;
- azione, entità e record;
- timestamp;
- esito `ALLOWED` o `DENIED`;
- prima/dopo sanificato;
- motivazione;
- request/correlation id;
- eventuale approvatore;
- policy o soglia applicata.

## RLS

Policy minime:

- deny by default;
- tenant isolation;
- membership attiva;
- controllo ruolo;
- scope sede/reparto;
- ownership/assignment per Staff;
- dati finanziari e HR separati;
- service role solo lato server;
- nessuna fiducia nei parametri inviati dal client.

## Deleghe

Una delega temporanea deve avere:

- concedente;
- beneficiario;
- permessi precisi;
- organizzazione/sede;
- inizio e scadenza;
- motivazione;
- revoca;
- audit.

Non sono ammesse deleghe permanenti implicite.

## Access review

La revisione periodica verifica:

- account inattivi;
- ruoli multipli;
- deleghe scadute;
- utenti senza membership valida;
- permessi eccessivi;
- accessi negati ripetuti;
- export effettuati;
- operazioni sensibili auto-approvate;
- Admin senza necessità tecnica;
- Direzione non più attiva.

## Evoluzione

Dopo il pilot i permessi potranno essere distribuiti su ruoli specializzati: `HR`, `FINANCE`, `RESPONSABILE_REPARTO`, `APPRENDISTA`, `AUDITOR` e `PARTNER`. L'MVP resta però comprensibile e testabile con Admin, Direzione e Staff.