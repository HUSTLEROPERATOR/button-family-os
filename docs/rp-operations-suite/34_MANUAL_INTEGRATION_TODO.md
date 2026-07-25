# 34 — Manual integration todo

## Scopo

Backlog dedicato all'integrazione del `GTA RP Manuale Operativo Bozza v1.0`. La fonte è una bozza: i task trasformano il contenuto in strutture configurabili senza attivare automaticamente le proposte.

## Regole

- `P0`: protezione fonte, stato bozza, permessi e audit;
- `P1`: necessario per Button parity / Organization OS MVP;
- `P2`: necessario per gestione completa del manuale;
- `P3`: evoluzione dopo pilot.

Stati: `DONE`, `READY`, `BLOCKED`, `IN_REVIEW`, `DEFERRED`.

## Fonte e tracciabilità

| ID | Task | Priorità | Stato | Dipendenza | Evidenza |
|---|---|---:|---|---|---|
| ORG-011 | Registrare e classificare la fonte PDF | P0 | DONE | — | documento 33 + audit |
| ORG-021 | Collegare fonte, requisiti, decisioni e versioni | P0 | IN_REVIEW | ORG-011 | traceability matrix |
| ORG-022 | Conservare il PDF originale nel source register/upload binario controllato | P2 | BLOCKED | processo upload | hash + path repository |
| ORG-023 | Confrontare la fonte con il codice Button recuperato | P0 | BLOCKED | M0/AUD-002 | parity report |
| ORG-024 | Classificare ogni regola come observed/proposed/approved/deferred | P0 | READY | ORG-023 parziale | rule register |

## Onboarding, tutor e valutazioni

| ID | Task | Priorità | Stato | Dipendenza | Evidenza |
|---|---|---:|---|---|---|
| ORG-012 | Modellare tutor e periodo di prova | P1 | READY | DATA-002 | schema + workflow |
| ORG-025 | Modellare obiettivi prova versionati | P1 | READY | ORG-012 | config contract |
| ORG-026 | Trasformare Appendice B in form digitale | P1 | READY | ORG-012/025 | form spec |
| ORG-027 | Separare esito proposto tutor ed esito Direzione | P0 | READY | AUTH matrix | permission tests |
| ORG-018 | Modellare valutazioni e azioni correttive | P1 | READY | DATA-002 | state machine |
| ORG-028 | Distinguere errore in buona fede e comportamento intenzionale | P2 | READY | ORG-018 | decision criteria |

## Depositi, dotazioni e accessi

| ID | Task | Priorità | Stato | Dipendenza | Evidenza |
|---|---|---:|---|---|---|
| ORG-013 | Modellare depositi, kit, outfit e veicoli operativi | P1 | READY | DATA-002 | ERD + cataloghi |
| ORG-029 | Modellare inventario a doppio controllo | P1 | READY | ORG-013 | workflow + test |
| ORG-030 | Modellare access review e revoche | P1 | READY | AUTH/RLS | review workflow |
| ORG-031 | Trasformare controlli settimanali in template ricorrenti | P2 | READY | ORG-019 | checklist template |

## Attività, missioni e intelligence

| ID | Task | Priorità | Stato | Dipendenza | Evidenza |
|---|---|---:|---|---|---|
| ORG-014 | Modellare activity ledger e divisione risultati | P1 | READY | DATA-002 | transaction model |
| ORG-032 | Definire quick log Discord e consolidamento app | P1 | READY | DIS architecture | integration contract |
| ORG-015 | Modellare mission plan e debrief | P1 | READY | DATA-002 | workflow + form |
| ORG-033 | Trasformare Appendice D in form digitale | P1 | READY | ORG-015 | form spec |
| ORG-016 | Modellare intelligence reports e livelli di verifica | P2 | READY | DATA-002/AUTH | schema + visibility tests |
| ORG-034 | Definire retention e visibilità intelligence | P1 | NEEDS_DECISION | Q-MAN-005 | policy |

## Problemi, decisioni e approvazione

| ID | Task | Priorità | Stato | Dipendenza | Evidenza |
|---|---|---:|---|---|---|
| ORG-017 | Modellare issue e decision register | P1 | READY | DATA-002 | workflow |
| ORG-035 | Trasformare Appendice C in form digitale | P1 | READY | ORG-017 | form spec |
| ORG-036 | Imporre review date alle decisioni temporanee | P0 | READY | ORG-017 | validation test |
| ORG-020 | Creare configuration approval register | P0 | READY | CORE versioning | approval schema |
| ORG-037 | Gestire firma/approvazione finale del manuale | P2 | NEEDS_DECISION | Q-MAN-010 | approval flow |

## Eventi, quote, vantaggi e bonus

| ID | Task | Priorità | Stato | Dipendenza | Evidenza |
|---|---|---:|---|---|---|
| ORG-038 | Modellare partecipazione eventi e relazioni | P2 | READY | Events module | event link model |
| ORG-039 | Modellare contatti/voucher da eventi | P2 | READY | ORG-038/CRM | data contract |
| ORG-040 | Modellare quote e cauzioni | P2 | NEEDS_DECISION | Q-MAN-007 | rule model |
| ORG-041 | Modellare vantaggi e sconti affiliati | P2 | NEEDS_DECISION | Q-MAN-008 | agreement model |
| ORG-042 | Collegare bonus operatività a evidenze e approvazione | P1 | READY | benefits/approval | test |

## Configurazioni proposte

| ID | Task | Priorità | Stato | Dipendenza | Evidenza |
|---|---|---:|---|---|---|
| ORG-043 | Inserire catalogo delle 16 proposte numeriche come inattive | P1 | READY | ORG-020 | seed template non eseguito |
| ORG-044 | Impedire attivazione senza Direzione e data efficacia | P0 | READY | AUTH/RLS | permission test |
| ORG-045 | Versionare valori per organizzazione e stagione | P0 | READY | seasons/catalogs | migration/schema |
| ORG-046 | Definire UI approva/modifica/elimina/rinvia | P2 | READY | ORG-020 | wireframe |

## Test

| ID | Test | Priorità | Stato |
|---|---|---:|---|
| TEST-ORG-001 | Tutor, prova, proroga, cambio ruolo ed esclusione | P1 | READY |
| TEST-ORG-002 | Inventario con due revisori, differenza e rettifica | P1 | READY |
| TEST-ORG-003 | Missione con autorizzazione, piano alternativo e debrief | P1 | READY |
| TEST-ORG-004 | Problema, decisione temporanea, review e decisione finale | P1 | READY |
| TEST-ORG-005 | Visibilità intelligence per Admin/Direzione/Staff | P0 | READY |
| TEST-ORG-006 | Regola `SOURCE_DRAFT` non attivabile senza approvazione | P0 | READY |
| TEST-ORG-007 | Staff non auto-approva esito, bonus o provvedimento | P0 | READY |
| TEST-ORG-008 | Quick log Discord non considerato record ufficiale | P1 | READY |
| TEST-ORG-009 | Configurazioni restano legate alla stagione originaria | P1 | READY |
| TEST-ORG-010 | Audit su revoche, rettifiche e provvedimenti | P0 | READY |

## Gate integrazione

Il manuale è considerato integrato nel blueprint quando:

- fonte e stato bozza sono registrati;
- tutti i contenuti hanno mapping a modulo/requisito/task;
- soglie e target sono inattivi e versionabili;
- appendici hanno form digitali specificati;
- ruoli e approvazioni sono definiti;
- data model e traceability sono aggiornati;
- decisioni aperte hanno owner e milestone;
- parity con l'app Button viene eseguita dopo M0;
- nessuna regola viene dichiarata attiva senza delibera della Direzione.