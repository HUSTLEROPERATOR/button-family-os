# 07 — Richiesta accesso tecnico B-01

## Scopo

Questa richiesta serve a chiudere il blocker **B-01 / Q-TECH-002** e completare la baseline tecnica di Button's Family OS senza condividere credenziali e senza modificare la produzione.

Progetto presumibilmente coinvolto:

- nome osservato nell'app: `button-family-os`;
- project ref sanitizzato: `mbd***zzv`;
- stato: **da confermare dal proprietario tecnico**.

L'accesso deve avvenire esclusivamente tramite invito nominativo al progetto o all'organizzazione Supabase. Non inviare password, token o chiavi in chat, email o documenti del repository.

## Conferme richieste

Il proprietario tecnico deve confermare per iscritto:

1. chi è il **Technical Owner** responsabile del progetto;
2. che il progetto `button-family-os` con ref sanitizzato `mbd***zzv` è quello corretto;
3. quale organizzazione Supabase contiene il progetto;
4. quali ambienti esistono oggi: produzione, staging, sviluppo, branch database o copie di test;
5. se produzione e staging sono realmente separati;
6. quale piano Supabase è attivo e se esistono limiti o rischio di pausa automatica;
7. chi è autorizzato ad approvare audit, backup, restore e future migrazioni.

## Accesso richiesto

Richiedere, tramite invito nominativo:

- accesso dashboard con il livello minimo necessario all'audit;
- accesso CLI nominativo solo se indispensabile;
- possibilità di consultare configurazioni e metadati senza leggere dati personali non necessari;
- possibilità di creare o verificare un backup prima di qualunque modifica futura;
- autorizzazione esplicita al solo audit read-only iniziale.

L'accesso non deve essere condiviso tra più persone e non deve usare account generici.

## Perimetro dell'audit read-only richiesto

L'autorizzazione deve coprire esclusivamente l'inventario di:

- schema e tabelle;
- migrazioni disponibili;
- policy RLS;
- configurazione Auth;
- RPC e funzioni database;
- trigger;
- Storage e relativi bucket/policy;
- Edge Functions;
- cron job, webhook e integrazioni;
- configurazioni di rete e segreti solo come presenza/metadato, senza copiarne i valori;
- stato dei backup e possibilità di restore isolato;
- ambienti e dipendenze collegate.

In questa fase non sono autorizzati:

- modifiche a schema o dati;
- esecuzione del template ruoli;
- creazione di utenti reali;
- variazioni RLS;
- rotazioni di chiavi;
- deploy;
- test distruttivi;
- lettura massiva o esportazione di dati utenti.

## Materiale che non deve essere condiviso

Non condividere mai:

- password personali;
- `service_role`;
- chiavi `sb_secret_*`;
- recovery code;
- token personali o CLI;
- sessioni browser;
- dump contenenti dati utenti;
- file `.env` completi;
- screenshot con segreti visibili.

Una credenziale condivisa accidentalmente deve essere considerata compromessa e ruotata dal proprietario tecnico.

## Modalità corretta di collaborazione

1. Il Technical Owner conferma identità e progetto.
2. L'owner invia un invito nominativo tramite Supabase.
3. L'utente invitato accede con il proprio account.
4. L'owner assegna il privilegio minimo sufficiente.
5. L'auditor registra soltanto evidenze sanitizzate.
6. Ogni futura scrittura richiede approvazione separata e backup verificato.

## Risposta minima richiesta al Technical Owner

```text
Technical Owner: <nome/ruolo>
Organizzazione Supabase: <nome>
Progetto confermato: SI / NO
Produzione identificata: SI / NO
Staging separato: SI / NO / NON ESISTE
Piano Supabase: <piano>
Backup prima dell'audit successivo: DISPONIBILE / DA PREPARARE
Accesso dashboard nominativo: APPROVATO / NON APPROVATO
Accesso CLI nominativo: APPROVATO / NON NECESSARIO / NON APPROVATO
Audit read-only autorizzato: SI / NO
Note: <eventuali vincoli>
```

## Criterio di completamento

La richiesta è soddisfatta quando:

- Technical Owner e progetto sono confermati;
- l'accesso nominativo è verificato;
- produzione e staging sono identificati;
- l'autorizzazione read-only è documentata;
- nessuna credenziale è stata condivisa fuori dai canali ufficiali.
