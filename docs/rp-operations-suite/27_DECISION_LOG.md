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

## DEC-014 — Tre profili iniziali
**Stato:** APPROVED  
L'MVP parte con tre profili applicativi: `ADMIN`, `DIREZIONE` e `STAFF`. I ruoli specializzati vengono aggiunti dopo la validazione del pilot.

## DEC-015 — Separazione Admin e Direzione
**Stato:** APPROVED  
Admin governa configurazione tecnica, utenti, ruoli e integrazioni; Direzione governa operazioni, personale ed economia. Admin non approva automaticamente payroll o movimenti sensibili; Direzione non modifica segreti, RLS o audit.

## DEC-016 — Account demo solo in staging
**Stato:** APPROVED  
La foundation deve prevedere `demo-admin`, `demo-direzione` e `demo-staff` in staging. Credenziali e link di accesso non vengono mai salvati nel repository.

## DEC-017 — Manuale Operativo GTA RP integrato come fonte bozza
**Stato:** APPROVED  
`GTA RP Manuale Operativo Bozza v1.0` entra nel blueprint come `SOURCE_DRAFT`. Il contenuto genera requisiti, form, task e decisioni aperte, ma non diventa automaticamente regolamento attivo.

## DEC-018 — Target e soglie del manuale sono configurazioni stagionali
**Stato:** APPROVED  
Durate, importi, frequenze, quantità, quote e sconti proposti dal manuale non vengono hardcodati. Ogni valore richiede organizzazione, stagione, stato, versione, unità, approvatore e data di efficacia.

## DEC-019 — Appendici trasformate in form digitali
**Stato:** APPROVED  
Checklist settimanale, scheda nuovo affiliato, modulo problema/soluzione e scheda missione diventano template configurabili dell'Organization OS.

## DEC-020 — Discord quick log, app record ufficiale
**Stato:** APPROVED  
La segnalazione immediata su Discord può alimentare un quick log, ma denaro, risorse, partecipanti, divisioni, autorizzazioni e debrief diventano ufficiali soltanto nel record strutturato dell'app.

## DEC-021 — Promozioni e provvedimenti restano decisioni umane
**Stato:** APPROVED  
Valutazioni e punteggi raccolgono evidenze; non producono automaticamente promozioni, limitazioni, sospensioni o esclusioni. Direzione decide, motiva e registra l'efficacia.

## DEC-022 — Decisioni temporanee con revisione obbligatoria
**Stato:** APPROVED  
Una soluzione temporanea a un problema procedurale deve avere autore, motivazione, data, review date e successivo esito definitivo o rinvio motivato.

## DEC-023 — Baseline live recuperata ma M0 non ancora chiuso
**Stato:** APPROVED  
La Slice 0 ha recuperato in sola lettura l'HTML live, registrando hash, dimensione, moduli, tabelle referenziate e rischi. Questa evidenza chiude il perimetro applicativo dell'export, ma non chiude M0 finché schema, RLS, Auth, Storage, backup e restore non sono verificati.

## DEC-024 — Gli export live restano fuori da Git
**Stato:** APPROVED  
HTML live, manifest runtime e backup contenenti metadati o dati dell'ambiente restano in cartelle ignorate. Git conserva script, hash, inventari sanitizzati, checklist e runbook, non la copia eseguibile della produzione.

## DEC-025 — Registro fonti obbligatorio
**Stato:** APPROVED  
Ogni manuale, export, materiale Discord o fonte esterna riceve un Source ID, stato, versione, hash quando disponibile, posizione di conservazione e collegamenti a requisiti e documenti di integrazione.

## DEC-026 — Azioni correttive separate per dominio
**Stato:** APPROVED  
Il modello distingue `organization_corrective_actions` e `incident_corrective_actions`. Una tabella generica potrà essere valutata solo con ADR, permessi e retention equivalenti.
