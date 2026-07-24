# 27 — Decision log

## DEC-001 — Suite a domini separati
**Stato:** APPROVED  
Button resta Organization OS; TNT è Business Operations OS. Shared Core contiene solo funzioni realmente comuni.

## DEC-002 — Button non viene ridisegnato
**Stato:** APPROVED  
L'app Button e i manuali personalizzati restano validi e devono mantenere parità funzionale.

## DEC-003 — TNT come pilota, non template rigido
**Stato:** APPROVED  
TNT valida il dominio automotive, ma servizi e processi restano configurabili per il prossimo wipe.

## DEC-004 — Business OS multi-verticale
**Stato:** APPROVED  
Officina, locale, casinò e business custom utilizzano la stessa codebase con moduli e template.

## DEC-005 — Payroll configurabile
**Stato:** APPROVED  
Supporto a fisso, percentuale personale, percentuale aziendale, prestazione e combinazioni.

## DEC-006 — Calcolo automatico con approvazione umana
**Stato:** APPROVED  
Il job calcola e propone; non esegue pagamenti senza approvazione.

## DEC-007 — Discord non è fonte dati
**Stato:** APPROVED  
Discord gestisce comunicazione, reminder e briefing; i dati ufficiali restano nell'app.

## DEC-008 — Cataloghi versionati
**Stato:** APPROVED  
Prezzi, servizi, ruoli, formule e regole variabili non devono stare nel manuale statico o nel codice.

## DEC-009 — Wipe archiviato
**Stato:** APPROVED  
Il cambio wipe crea una nuova stagione e conserva lo storico.

## DEC-010 — Audit-first
**Stato:** APPROVED  
Prima di sviluppo o migrazione si recupera e protegge lo stato esistente.

## DEC-011 — Documentazione su branch separato
**Stato:** APPROVED  
Branch `docs/rp-operations-suite-blueprint`, Draft PR, nessun merge, deploy o modifica Supabase durante questa attività.

## DEC-012 — Tracciabilità obbligatoria
**Stato:** APPROVED  
Ogni requisito deve collegarsi a task, modello dati, test, milestone ed evidenza.

## DEC-013 — Record economici versionati
**Stato:** APPROVED  
Periodi approvati e movimenti economici non vengono sovrascritti silenziosamente; correzioni tramite rettifica, storno o nuova versione.