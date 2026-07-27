# 18 — Wipe and season management

## Obiettivo

Gestire cambiamenti del server senza hardcodare attività e senza perdere lo storico.

## Entità stagione

Campi: server, nome, codice, data inizio/fine, stato, configurazione, cataloghi attivi, regole e note di migrazione.

Stati: `DRAFT`, `PLANNED`, `ACTIVE`, `CLOSING`, `ARCHIVED`.

## Cosa versionare

Ruoli, livelli, servizi, prodotti, prezzi, formule stipendio, sconti, convenzioni, procedure, obiettivi, KPI, partner, sedi e attività.

## Chiusura wipe

1. blocco modifiche strutturali;
2. chiusura lavori e movimenti;
3. inventario;
4. chiusura cassa;
5. chiusura payroll;
6. report finale;
7. snapshot configurazioni;
8. export;
9. archiviazione;
10. creazione nuova stagione.

## Carry-over

Configurabile per utenti, personaggi, membership, ruoli, competenze, procedure, clienti, veicoli, saldo, inventario, prestiti e accordi. Ogni carry-over deve essere esplicito e auditato.

## Regole

- nessun record storico cambia stagione retroattivamente;
- i cataloghi della vecchia stagione restano consultabili;
- le nuove formule valgono dalla data prevista;
- le comparazioni tra wipe indicano differenze di configurazione;
- archiviare non significa cancellare.