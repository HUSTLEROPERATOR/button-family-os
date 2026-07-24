# 31 — MVP release slices

## Perché usare release slice

La suite è troppo ampia per essere costruita come un unico blocco. Ogni slice deve produrre una demo verticale, dati verificabili, test e rollback. Una slice non è una semplice lista di schermate.

## Slice 0 — Baseline Recovery

### Demo

Mostrare che l'app Button attuale può essere esportata, identificata tramite hash, ripristinata in ambiente isolato e confrontata con la produzione senza modificarla.

### Include

Codice/HTML live, asset, schema, RLS, storage, backup, restore, parity checklist e rollback runbook.

### Acceptance

- origine e versione note;
- conteggi coerenti;
- restore riuscito;
- nessun dato perso;
- produzione invariata.

### Rollback

Non applicabile alla produzione: la slice è audit-only.

## Slice 1 — Secure Foundation

### Demo

Utente autorizzato accede, seleziona un'organizzazione, legge e modifica un record consentito; un utente esterno viene bloccato; ogni azione viene auditata.

### Include

Auth, organizations, seasons, membership, roles, permissions, RLS, audit, CI, staging e seed sintetici.

### Acceptance

- isolamento tenant;
- deny-by-default;
- audit completo;
- staging indipendente;
- CI verde.

### Rollback

Disattivazione feature flag e ripristino precedente deploy staging.

## Slice 2 — Button Parity

### Demo

Un flusso Button esistente viene completato nella nuova foundation con gli stessi dati e risultati della baseline.

### Include

Membri, ruoli/livelli, missioni/obiettivi, valutazioni, manuali/procedure, wipe e import.

### Acceptance

- parity checklist completa;
- import idempotente;
- conteggi origine/destinazione;
- UAT Button;
- legacy ancora ripristinabile.

### Rollback

Ritorno al loader/legacy e conservazione del report di migrazione.

## Slice 3 — Business Transaction

### Demo

Cliente → preventivo → ordine di lavoro → assegnazione → vendita → pagamento → movimento cassa → audit.

### Include

CRM minimo, catalogo/listino, work order, sale, payment, cash movement e permessi.

### Acceptance

- nessun doppio pagamento;
- importi e stati coerenti;
- sconto autorizzato;
- esperienza mobile;
- report di chiusura della transazione.

### Rollback

Feature flag Business OS disattivata; dati staging conservati per analisi.

## Slice 4 — Inventory and Purchasing

### Demo

Richiesta acquisto → approvazione → ordine → ricezione → carico magazzino → consumo su lavoro → inventario.

### Include

Fornitori, purchase orders, goods receipt, inventory movements, soglie e stock count.

### Acceptance

- giacenza derivata solo da movimenti;
- nessun doppio ricevimento;
- rettifiche motivate;
- test concorrenza;
- differenze inventariali leggibili.

### Rollback

Storno dei movimenti di test e disattivazione modulo.

## Slice 5 — Payroll Deterministic

### Demo

Un periodo contiene vendite e bonus; il sistema simula, calcola, spiega, sottopone ad approvazione e blocca il prospetto.

### Include

Contratti, fisso, percentuale personale, formula ibrida, bonus, snapshot, golden tests, periodi, review e approval.

### Acceptance

- risultato deterministico;
- spiegazione riga per riga;
- nessun doppio job;
- periodo approvato immutabile;
- riapertura versionata;
- export prospetto.

### Rollback

Annullamento del run non approvato o nuova versione/rettifica dopo approvazione; mai sovrascrittura silenziosa.

## Slice 6 — TNT Pilot

### Demo

Una settimana reale o simulata completa dell'officina, dal cliente al pagamento e al prospetto stipendi.

### Include

Veicoli, diagnosi, preventivi, assegnazioni, ricambi, lavorazione, controllo qualità, consegna, incasso, formazione apprendisti, dashboard e payroll.

### Acceptance

- tutti i lavori del periodo registrati;
- vendita/cassa/magazzino riconciliati;
- prospetti verificati;
- utenti lavorano da mobile;
- feedback classificato;
- nessun blocker P0/P1.

### Rollback

Ritorno al processo precedente per il wipe corrente, conservando export e audit del pilota.

## Slice 7 — Advanced Operations

Finanza avanzata, eventi, sponsor, marketing, prestiti, investimenti e imprevisti. Parte solo dopo la decisione go del pilota TNT.

## Slice 8 — Discord Read Layer

Notifiche, briefing, reminder, link autenticati e comandi read-only. Nessuna scrittura economica da Discord in questa slice.

## Regola demo

Ogni slice deve avere:

1. script demo di massimo 10 minuti;
2. dataset controllato;
3. criteri di accettazione;
4. test automatici;
5. evidenze;
6. rollback;
7. decisione `GO`, `FIX`, `STOP` o `DEFER`.

## Regola di avanzamento

Non si inizia una slice che dipende da un gate fallito. Le attività di ricerca e design possono proseguire, ma non vengono trattate come implementazione approvata.