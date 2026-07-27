# 33 — Integrazione del Manuale Operativo GTA RP

## Fonte

Documento analizzato: `GTA_RP_Manuale_Operativo_Bozza(1).pdf`, 16 pagine, versione 1.0, dichiarato esplicitamente come bozza da visionare, modificare e approvare prima dell'applicazione.

## Stato della fonte

`SOURCE_DRAFT — INTEGRATED_AS_REQUIREMENTS, NOT_APPROVED_AS_RULES`

L'integrazione nel blueprint non rende automaticamente definitive le soglie, i target o le procedure proposte. I contenuti vengono trasformati in:

- requisiti funzionali;
- moduli configurabili;
- entità e workflow;
- moduli compilabili;
- decisioni da approvare;
- test e criteri di accettazione.

## Principi recepiti

1. Le regole devono migliorare organizzazione, affidabilità e qualità RP senza sostituire il buon senso.
2. L'assenza di una regola specifica non autorizza l'aggiramento dello scopo della procedura.
3. Ogni attività deve avere responsabilità riconoscibili: chi decide, chi esegue e chi verifica.
4. Il tutor accompagna, controlla e documenta la formazione, senza eliminare la responsabilità personale del sottoposto.
5. Denaro, materiali, accessi e responsabilità devono lasciare una traccia proporzionata e verificabile.
6. Discord supporta la registrazione immediata; l'app gestionale conserva il record ufficiale e il riepilogo strutturato.
7. Missioni, target e criteri numerici devono essere configurabili per server, wipe e stagione.
8. Valutazioni, correzioni e promozioni richiedono elementi osservabili e decisione umana.
9. Dubbi, falle e decisioni temporanee devono entrare in un registro, non essere sfruttati come cavilli.
10. Le procedure diventano definitive solo dopo approvazione e data di efficacia.

## Mappatura sezione → modulo applicativo

| Manuale | Contenuto | Modulo OS | Dati / workflow |
|---|---|---|---|
| 1 | principi e buon senso | Governance / Procedures | principi versionati, acknowledgement, eccezioni |
| 2 | leadership e tutor | Membership / Training | tutor assignments, responsabilità, report tutor |
| 3 | nuovi affiliati e prova | Onboarding / Evaluation | probation periods, checklist, esito, motivazione |
| 4 | depositi e accessi | Inventory / Access Review | depositi, conteggi, differenze, access review |
| 5 | dotazioni, outfit e veicoli | Assets / Readiness | kit personali, outfit set, mezzi operativi, controlli |
| 6 | attività e transazioni | Operations Ledger | quick log Discord, activity record, transazioni, divisioni |
| 7 | missioni e obiettivi | Mission Planning | piano, autorizzazioni, partecipanti, target, debrief |
| 8 | intelligence RP | Intelligence / Relationships | report, fonte, affidabilità, collegamenti, opportunità/rischi |
| 9 | eventi e relazioni | Events / Network | partecipazioni, contatti, voucher, collaborazioni |
| 10 | quote, vantaggi e bonus | Contributions / Benefits | quote, cauzioni, sconti, voucher, bonus, accessi |
| 11 | dubbi e cavilli | Issues / Decisions | segnalazione, soluzione, decisione temporanea/definitiva |
| 12 | valutazioni e provvedimenti | Evaluation / Corrective Actions | criteri, esiti, limitazioni, sospensioni, audit |
| 13 | punti da decidere | Configuration Approval | proposta, decisione, note, efficacia, approvatore |
| App. A | checklist settimanale | Recurring Checklists | checklist per stagione, owner, esito e follow-up |
| App. B | scheda nuovo affiliato | Onboarding Form | obiettivi, tutor, valutazione 1–5, esito |
| App. C | problema e soluzione | Issue Form | problema, impatto, ruoli, proposta, decisioni |
| App. D | pianificazione missione | Mission Form | briefing, piano A/B, mezzi, autorizzazioni, debrief |
| Approvazione | firme e ruoli | Approval Workflow | approvatori, timestamp, versione, stato |

## Regole numeriche: configurazione, non hardcode

Le seguenti voci sono state rilevate come proposte da valutare. Devono essere registrate in cataloghi/regole versionate e restare `PROPOSED` fino ad approvazione:

| Codice | Proposta sorgente | Tipo configurazione |
|---|---|---|
| CFG-PROB-001 | periodo di prova di 14 giorni | durata onboarding |
| CFG-PROB-002 | 50.000 puliti a settimana | target economico prova |
| CFG-PROB-003 | almeno tre lavori/script legali differenti | target varietà attività |
| CFG-PROB-004 | due briefing, una missione, un evento, cinque registrazioni | checklist prova |
| CFG-INV-001 | inventario una volta a settimana | recurring schedule |
| CFG-INV-002 | controllo inventario da due persone | approval/separation rule |
| CFG-ACC-001 | controllo accessi ogni due settimane | recurring access review |
| CFG-ASSET-001 | almeno tre outfit anonimi identici | readiness requirement |
| CFG-ASSET-002 | veicoli speciali identici | mission asset policy |
| CFG-MIS-001 | preavviso missione di cinque ore | mission notice rule |
| CFG-MIS-002 | target Fleeca/Negozi/Blaine/Pacific | seasonal mission targets |
| CFG-INT-001 | tre azioni informative settimanali | intelligence target |
| CFG-EVT-001 | tre eventi esterni a settimana | event participation target |
| CFG-EVT-002 | due eventi propri al mese | owned event target |
| CFG-CONTR-001 | quota 2M sporchi o 500k puliti | contribution/deposit rule |
| CFG-BEN-001 | sconto affiliati del 25% | benefit/discount rule |

Ogni configurazione deve contenere almeno:

- `organization_id`;
- `season_id`;
- stato `PROPOSED | APPROVED | SUSPENDED | RETIRED`;
- valore e unità;
- data di efficacia;
- fonte;
- motivazione;
- approvatore;
- eventuale scadenza;
- storico versioni.

## Nuovi moduli Organization OS

### Tutoraggio e prova

Workflow:

```text
CANDIDATE → PROBATION → REVIEW_DUE → APPROVED | EXTENDED | ROLE_CHANGED | REJECTED
```

Campi minimi:

- affiliato;
- tutor;
- ruolo iniziale;
- data inizio/fine prevista;
- obiettivi configurati;
- evidenze;
- valutazioni 1–5;
- esito;
- motivazione;
- approvazione Direzione.

### Depositi, dotazioni e accessi

Il sistema deve distinguere:

- depositi comuni;
- borsoni/kit personali;
- categorie materiali;
- garage e veicoli operativi;
- accessi attivi;
- inventario teorico e reale;
- differenze;
- revisori;
- rettifiche motivate;
- revoche accesso.

Ogni controllo sensibile richiede due responsabili quando la relativa policy è attiva.

### Registro attività

Workflow:

```text
QUICK_LOG → DRAFT_DETAIL → SUBMITTED → REVIEWED → CLOSED
```

Il quick log può provenire da Discord e contiene solo dati minimi. Il record ufficiale nell'app contiene:

- data e orario;
- tipo attività;
- responsabile e partecipanti;
- risorse usate/ottenute/perse/restituite;
- denaro incassato/speso;
- divisione risultati;
- problemi, ticket e conseguenze;
- informazioni raccolte;
- collegamenti a inventario, missione e decisioni.

### Mission planning e debrief

Stati:

```text
DRAFT → SUBMITTED → APPROVED → ACTIVE → DEBRIEF_DUE → CLOSED
```

Campi minimi:

- nome, data, responsabile;
- partecipanti e ruoli;
- obiettivo e durata;
- veicoli, outfit e attrezzature;
- punto di ritrovo e percorso;
- piano principale e alternativo;
- ticket/autorizzazioni;
- comunicazioni;
- risultato netto;
- perdite/problemi;
- cosa ha funzionato;
- cosa correggere;
- registrazioni completate.

### Intelligence RP

Ogni informazione deve distinguere:

- `RUMOR`;
- `UNVERIFIED`;
- `PARTIALLY_VERIFIED`;
- `VERIFIED`;
- `DISPROVED`.

Campi: fonte RP, contesto, soggetti, attendibilità, verifiche, relazioni, rischi, opportunità, visibilità e scadenza/revisione. L'accesso è limitato per ruolo.

### Registro problemi e decisioni

Workflow:

```text
REPORTED → TRIAGED → TEMPORARY_DECISION → REVIEW_DUE → APPROVED | MODIFIED | REJECTED
```

Deve conservare problema, conseguenze, persone/ruoli coinvolti, soluzione proposta, decisione temporanea, decisione definitiva, data revisione e audit. Una decisione temporanea deve avere scadenza o review date obbligatoria.

### Valutazioni e provvedimenti

Esiti configurabili iniziali:

- riconoscimento;
- conferma;
- correzione/formazione;
- osservazione;
- limitazione;
- sospensione;
- esclusione.

Il sistema non deve trasformare automaticamente un punteggio in sanzione o promozione. Direzione decide, motiva e registra l'efficacia. Gli errori dichiarati e corretti devono poter essere distinti dai comportamenti intenzionali o ripetuti.

## Matrice ruoli iniziali

### ADMIN

- configura moduli, form, cataloghi e workflow;
- gestisce accessi tecnici e audit;
- non decide automaticamente promozioni, esclusioni o sanzioni;
- non approva quote/bonus personali senza Direzione.

### DIREZIONE

- approva procedure e configurazioni stagionali;
- nomina tutor e decide esiti della prova;
- autorizza missioni sensibili;
- approva inventari, differenze e revoche accesso;
- approva bonus, benefit, quote e provvedimenti;
- convalida decisioni temporanee e definitive.

### STAFF

- consulta procedure applicabili;
- compila attività, missioni e debrief assegnati;
- aggiorna il proprio onboarding;
- segnala differenze, problemi e proposte;
- consulta solo dotazioni, obiettivi e dati autorizzati;
- non approva il proprio esito, bonus o provvedimento.

## Form digitali derivati dalle appendici

### Weekly organization check

Sezioni: depositi, accessi, dotazioni, veicoli, registrazioni, missioni, eventi, affiliati e problemi. Ogni riga deve avere esito, note, owner, follow-up, scadenza e prova.

### New affiliate review

Campi della scheda affiliato più obiettivi configurabili, evidenze, punteggi, commenti tutor, esito proposto ed esito Direzione.

### Procedure issue

Campi dell'Appendice C, con allegati, severità, responsabile, decisione temporanea, review date e link alla versione della procedura.

### Mission form

Campi dell'Appendice D, con controlli di completezza, autorizzazioni, asset, partecipanti, debrief e collegamento ai movimenti.

## Requisiti derivati

- `FR-ORG-001` — principi e procedure versionate con stato e approvazione.
- `FR-ORG-002` — tutor assignment e responsabilità di formazione.
- `FR-ORG-003` — periodo di prova configurabile con checklist ed esito umano.
- `FR-ORG-004` — depositi, kit personali, mezzi e controlli inventariali.
- `FR-ORG-005` — revisione periodica e revoca degli accessi.
- `FR-ORG-006` — registro strutturato di attività, transazioni e divisioni.
- `FR-ORG-007` — mission planning, autorizzazione e debrief.
- `FR-ORG-008` — obiettivi stagionali configurabili e non hardcoded.
- `FR-ORG-009` — intelligence RP con livello di verifica e visibilità.
- `FR-ORG-010` — eventi, relazioni, contatti e voucher/benefit.
- `FR-ORG-011` — quote, cauzioni, vantaggi e bonus versionati.
- `FR-ORG-012` — registro problemi, cavilli, decisioni temporanee e definitive.
- `FR-ORG-013` — valutazioni, correzioni e provvedimenti con approvazione umana.
- `FR-ORG-014` — checklist settimanali configurabili e follow-up.
- `FR-ORG-015` — approvazione formale di procedure e configurazioni.

## Task derivati

- `ORG-011` — registrare e classificare la fonte PDF.
- `ORG-012` — modellare tutor e prova affiliato.
- `ORG-013` — modellare depositi, kit e access review.
- `ORG-014` — modellare activity ledger e divisione risultati.
- `ORG-015` — modellare mission plan/debrief.
- `ORG-016` — modellare intelligence reports.
- `ORG-017` — modellare issue/decision register.
- `ORG-018` — modellare evaluations/corrective actions.
- `ORG-019` — trasformare appendici in form configurabili.
- `ORG-020` — creare configuration approval register.
- `ORG-021` — collegare manuale, procedure e versioni.
- `TEST-ORG-001` — test onboarding/tutor.
- `TEST-ORG-002` — test inventario e doppio controllo.
- `TEST-ORG-003` — test mission workflow e permessi.
- `TEST-ORG-004` — test issue/decision lifecycle.
- `TEST-ORG-005` — test visibilità intelligence.
- `TEST-ORG-006` — test nessuna soglia proposta diventa attiva senza approvazione.

## Criteri di accettazione dell'integrazione

- la fonte è registrata come bozza, non come regolamento definitivo;
- ogni soglia numerica è configurabile e inattiva di default;
- le appendici hanno una corrispondenza con form digitali;
- Discord non sostituisce il record ufficiale;
- tutor e Direzione hanno responsabilità distinte;
- ogni rettifica, revoca, provvedimento e decisione lascia audit;
- Staff non può auto-approvare esiti, bonus o limitazioni;
- ogni configurazione è legata a organizzazione e stagione;
- le funzioni derivate entrano nella parity checklist solo se osservate nell'app Button esistente;
- la futura implementazione rispetta il regolamento del server e non attiva procedure non approvate.

## Decisioni ancora aperte

- quali proposte numeriche approvare per il prossimo wipe;
- chi può essere tutor e quanti affiliati può seguire;
- categorie reali di depositi, materiali e accessi;
- quali operazioni richiedono doppio controllo;
- quali dati intelligence sono visibili a Staff;
- chi approva missioni e con quale preavviso;
- regole di quota/cauzione e restituzione;
- cumulabilità dello sconto affiliati con altre convenzioni;
- durata e revisione di limitazioni/sospensioni;
- modalità di firma/approvazione digitale del manuale.

## Nota sul file originale

Il contenuto è integrato semanticamente nel blueprint. Il PDF binario non è stato aggiunto dal connettore GitHub, che in questa operazione scrive soltanto file testuali. Il file originale deve essere conservato nel registro fonti e potrà essere caricato successivamente in `docs/source-materials/` tramite un processo di upload binario controllato, senza sostituire questa mappatura versionata.