# 23 — Migration plan

## Strategia

Migrazione incrementale con Button protetto e rollback sempre disponibile.

## Step 1 — Freeze e snapshot

- registrare commit e versione live;
- esportare app e asset;
- esportare schema/dati;
- creare backup;
- calcolare hash;
- documentare dipendenze;
- non modificare produzione.

## Step 2 — Baseline versionata

- importare sorgente nel repository;
- separare codice, configurazione e dati;
- aggiungere README tecnico;
- eseguire test smoke;
- creare tag baseline.

## Step 3 — Ambiente staging

- progetto o branch isolato;
- dati sanificati;
- schema equivalente;
- segreti distinti;
- deploy separato;
- nessuna dipendenza da produzione per i test ordinari.

## Step 4 — Shared Core

Identità, organizzazioni, membership, ruoli, audit, seasons e adapter legacy.

## Step 5 — Import Button

Membri, ruoli, livelli, missioni, obiettivi, risorse, procedure, documenti e storico.

Ogni import produce:
- conteggio origine/destinazione;
- errori;
- duplicati;
- record scartati;
- checksum;
- report firmato.

## Step 6 — Parity

Checklist schermata per schermata e funzione per funzione. Nessuna funzione Button viene rimossa senza decisione approvata.

## Step 7 — Cutover controllato

- finestra concordata;
- backup finale;
- delta import;
- smoke test;
- go/no-go;
- monitoraggio;
- rollback trigger.

## Rollback trigger

Perdita dati; accesso non autorizzato; payroll errato; impossibilità login; regressione critica Button; errori transazionali; restore non disponibile.

## Post-migrazione

Confronto record; verifica permessi; controllo log; feedback utenti; chiusura issue; archiviazione legacy solo dopo un periodo di stabilità concordato.