# 08 — Checklist accesso B-01

## Obiettivo

Verificare in modo tracciabile che il progetto Supabase corretto, il Technical Owner e gli accessi minimi siano stati identificati prima di qualsiasi attività su schema, RLS, utenti, backup o staging.

## Stati ammessi

- `NOT STARTED` — attività non ancora avviata;
- `BLOCKED` — attività dipendente da una conferma o accesso mancante;
- `VERIFIED` — evidenza verificata e registrata;
- `NOT APPLICABLE` — voce non applicabile, con motivazione obbligatoria.

## Checklist

| # | Verifica | Stato iniziale | Dipendenza | Evidenza richiesta | Responsabile | Data verifica |
|---:|---|---|---|---|---|---|
| 1 | Technical Owner nominato | NOT STARTED | nessuna | conferma scritta con nome e ruolo | Owner business | — |
| 2 | Organizzazione Supabase identificata | NOT STARTED | 1 | nome organizzazione visibile da invito/dashboard | Technical Owner | — |
| 3 | Progetto corretto confermato | NOT STARTED | 1 | nome progetto + ref sanitizzato confrontato con la baseline | Technical Owner | — |
| 4 | Ambiente produzione identificato | BLOCKED | 2, 3 | progetto/branch dichiarato produzione | Technical Owner | — |
| 5 | Staging identificato o dichiarato assente | BLOCKED | 2, 3 | progetto o branch dedicato, oppure dichiarazione `NON ESISTE` | Technical Owner | — |
| 6 | Accesso dashboard nominativo verificato | BLOCKED | 1, 2, 3 | invito nominativo accettato e ruolo documentato | Technical Owner + Auditor | — |
| 7 | Accesso CLI verificato o non necessario | BLOCKED | 6 | login nominativo funzionante o motivazione `NOT APPLICABLE` | Technical Owner + Auditor | — |
| 8 | Possibilità di backup confermata | BLOCKED | 4, 6 | procedura o funzione disponibile, senza esecuzione distruttiva | Technical Owner | — |
| 9 | Policy RLS leggibili | BLOCKED | 6 | elenco policy consultabile in read-only | Auditor | — |
| 10 | Schema leggibile | BLOCKED | 6 | inventario tabelle, colonne, relazioni e vincoli | Auditor | — |
| 11 | RPC e funzioni leggibili | BLOCKED | 6 | elenco firme e privilegi, senza esecuzione mutativa | Auditor | — |
| 12 | Storage leggibile | BLOCKED | 6 | elenco bucket e policy, senza download massivo | Auditor | — |
| 13 | Configurazione Auth leggibile | BLOCKED | 6 | provider, redirect e policy osservabili senza dati sensibili | Auditor | — |
| 14 | Nessuna credenziale condivisa | VERIFIED | continua | verifica a ogni passaggio; nessun secret nel repo/chat | Tutti | 2026-07-25 |
| 15 | Audit read-only autorizzato per iscritto | NOT STARTED | 1, 3 | approvazione esplicita del perimetro del documento 07 | Technical Owner | — |
| 16 | Data e responsabile della verifica finale registrati | BLOCKED | 1–15 | firma operativa nel verbale di chiusura B-01 | Auditor + Technical Owner | — |

## Regole di compilazione

1. Non trasformare una voce in `VERIFIED` senza evidenza concreta.
2. Non copiare segreti, chiavi o dati utenti come prova.
3. Gli screenshot devono essere sanitizzati.
4. Una voce `NOT APPLICABLE` deve riportare motivazione, autore e data.
5. Un invito generico o un account condiviso non soddisfa le voci 6 e 7.
6. L'accesso deve rispettare il principio del privilegio minimo.
7. Ogni cambio di progetto, owner o ambiente riapre le verifiche correlate.

## Gate di chiusura B-01

B-01 può essere dichiarato chiuso solo quando sono `VERIFIED` almeno le voci:

- 1 — Technical Owner;
- 2 — organizzazione;
- 3 — progetto;
- 4 — produzione;
- 5 — staging identificato o assenza formalizzata;
- 6 — dashboard nominativa;
- 8 — possibilità di backup;
- 15 — autorizzazione audit;
- 16 — verifica finale.

La voce 7 può essere `NOT APPLICABLE` se la dashboard è sufficiente. Le voci 9–13 possono essere completate durante l'audit autorizzato, ma devono risultare verificabili prima di chiudere il gate M0 completo.

## Blocker collegati

| Blocker | Descrizione | Sblocco |
|---|---|---|
| B-01 | Accesso dashboard/CLI e owner non confermati | voci 1–7 e 15 |
| B-02 | RLS reali ignote | voci 6 e 9 |
| B-03 | Conteggi e consistenza dati non verificati | accesso autorizzato + piano dati minimizzato |
| B-04 | Backup/restore non verificati | voci 8 e staging disponibile |
| B-05 | Staging assente o non confermato | voce 5 |
| B-06 | Schema non versionato | voci 10 + piano migrazioni Slice 1 |
| B-07 | Auth/ruoli legacy non mappati server-side | voci 9, 11 e 13 |

## Verbale di chiusura

```text
B-01 status: OPEN / CLOSED
Technical Owner: <nome/ruolo>
Auditor: <nome/ruolo>
Progetto verificato: <nome + ref sanitizzato>
Produzione: <identificativo sanitizzato>
Staging: <identificativo sanitizzato / NON ESISTE>
Data verifica: <YYYY-MM-DD>
Voci non VERIFIED: <elenco + motivazione>
Rischi accettati: <elenco>
Prossimo gate autorizzato: <gate>
```
