# 28 — Open questions and decision queue

## Scopo

Le questioni aperte non sono una lista generica: ogni voce deve avere priorità, milestone bloccata, owner di ruolo, default raccomandato e stato.

Stati: `OPEN`, `PARTIALLY_RESOLVED`, `IN_REVIEW`, `BLOCKED`, `RECOMMENDED`, `APPROVED`, `DEFERRED`, `REJECTED`.

Priorità:
- `P0`: blocca baseline, sicurezza o architettura;
- `P1`: blocca MVP o pilota;
- `P2`: serve prima della productizzazione;
- `P3`: può essere decisa dopo il pilota.

## Decisioni P0 — da chiudere prima di M0/M1

| ID | Decisione | Blocca | Default raccomandato | Owner | Stato |
|---|---|---|---|---|---|
| Q-TECH-001 | Dove si trova il codice completo servito da Supabase? | M0 | HTML live recuperato e inventariato; restano da localizzare sorgente strutturato, schema, migrazioni, Storage e backend | Technical Owner | PARTIALLY_RESOLVED |
| Q-TECH-002 | Chi possiede accesso al progetto Supabase Button? | M0 | Verificare account/progetto effettivo e nominare un owner tecnico | Product + Technical Owner | OPEN |
| Q-TECH-003 | Qual è la strategia repository? | M1 | Tenere `button-family-os` come legacy/docs durante l'audit; creare il repo suite solo dopo M0 | Product/Technical Owner | RECOMMENDED |
| Q-TECH-004 | Progetto Supabase esistente o nuovo? | M1/M2 | Non riusare produzione per sviluppo; nuovo progetto/branch isolato per staging | Technical Owner | RECOMMENDED |
| Q-BTN-001 | Quali funzioni Button sono baseline obbligatoria? | M0/M3 | Usare la parity checklist osservata come proposta; Button Owner approva l'elenco definitivo | Button Owner | IN_REVIEW |
| Q-BTN-002 | Quali dati Button devono migrare? | M3 | Dati attivi + storico necessario; demo separata; nessuna cancellazione implicita | Button Owner | BLOCKED |
| Q-SEC-001 | Chi approva ruoli, export e operazioni economiche? | M1/M2 | Admin gestisce utenti/configurazione; Direzione approva operazioni; doppia approvazione per azioni sensibili | Product/Security Owner | APPROVED |
| Q-PROD-001 | Qual è il perimetro MVP definitivo? | M1 | Button parity + Business vertical slice + Payroll + TNT pilot; advanced modules dopo UAT | Product Owner | RECOMMENDED |

## Decisioni P1 — da chiudere prima di M3/M4/M5/M6

### Prodotto e UX

| ID | Decisione | Blocca | Default raccomandato | Owner | Stato |
|---|---|---|---|---|---|
| Q-PROD-002 | Nome finale del prodotto | M10 | `RP Operations Suite` come working name fino al pilota | Product Owner | RECOMMENDED |
| Q-PROD-003 | Home unica o portali distinti? | M2/M4 | Un account e workspace switcher; dashboard separate per Organization e Business OS | Product/UX Owner | RECOMMENDED |
| Q-PROD-004 | Quali template nella prima release? | M10 | Button + Automotive; hospitality/casinò dopo validazione | Product Owner | RECOMMENDED |
| Q-PROD-005 | Livello white-label iniziale | M10 | Logo, colori, nomi, ruoli e moduli; niente fork o custom code nel base package | Product Owner | RECOMMENDED |
| Q-UX-001 | Quali azioni devono stare entro tre passaggi? | M4/M6 | Registrazione lavoro, vendita, pagamento, turno, acquisto e segnalazione imprevisto | UX/Business Owner | OPEN |

### Manuale Operativo GTA RP

Tutte le proposte restano inattive fino alla decisione. Il default raccomandato è conservarle come configurazioni per organizzazione e stagione.

| ID | Decisione | Blocca | Default raccomandato | Owner | Stato |
|---|---|---|---|---|---|
| Q-MAN-001 | Durata standard del periodo di prova | M3 | 14 giorni come valore demo modificabile, non attivo per default | Button/Direzione | OPEN |
| Q-MAN-002 | Obiettivi economici e attività della prova | M3 | Template configurabile; nessun target obbligatorio finché non approvato | Button/Direzione | OPEN |
| Q-MAN-003 | Chi può fare il tutor e quanti affiliati può seguire | M3 | Tutor nominato da Direzione; limite configurabile | Button/Direzione | OPEN |
| Q-MAN-004 | Quali controlli richiedono due responsabili | M3 | Inventario, rettifiche e access review sensibili | Direzione/Security | RECOMMENDED |
| Q-MAN-005 | Visibilità delle informazioni intelligence | M3 | Staff vede solo record assegnati; Direzione visibilità completa; Admin solo supporto sanitizzato | Security/Button | RECOMMENDED |
| Q-MAN-006 | Preavviso e approvazione missioni | M3 | Preavviso configurabile; approvazione Direzione per missioni sensibili | Button/Direzione | RECOMMENDED |
| Q-MAN-007 | Quota/cauzione di ingresso e restituzione | M7 | Modulo disattivato fino a decisione economica esplicita | Direzione/Finance | OPEN |
| Q-MAN-008 | Sconto affiliati e cumulabilità | M7 | Benefit configurabile, non cumulabile salvo regola espressa | Direzione/Business | OPEN |
| Q-MAN-009 | Durata di osservazioni, limitazioni e sospensioni | M3 | Data inizio/fine e review obbligatorie | Direzione/HR | RECOMMENDED |
| Q-MAN-010 | Firma e approvazione digitale del manuale | M3 | Approvazione applicativa con versione/timestamp; firma grafica opzionale futura | Product/Technical | RECOMMENDED |
| Q-MAN-011 | Target missioni, intelligence ed eventi | M3/M7 | Catalogo stagionale inattivo finché approvato | Button/Direzione | OPEN |
| Q-MAN-012 | Categorie reali di depositi, materiali, outfit e veicoli | M3 | Cataloghi configurabili derivati dal wipe corrente | Button/Operations | OPEN |
| Q-MAN-013 | Quale parte del manuale è già presente in Button OS | M0/M3 | Confrontare documento 33 con la parity checklist della baseline live | Button/Technical | IN_REVIEW |
| Q-MAN-014 | Dove conservare il PDF originale e quale hash registrare | M3 | Source register con SHA-256 e posizione controllata; nessun binario sensibile senza review | Product/Content | OPEN |

### TNT e prossimo wipe

| ID | Decisione | Blocca | Default raccomandato | Owner | Stato |
|---|---|---|---|---|---|
| Q-TNT-001 | Servizi e workflow reali | M6 | Confermare dopo wipe; usare catalogo demo prima | TNT Owner | OPEN |
| Q-TNT-002 | Listino e ricambi | M6 | Versionati per stagione; nessun valore hardcoded | TNT Owner | RECOMMENDED |
| Q-TNT-003 | Ruoli e reparti | M6 | Profili applicativi Admin/Direzione/Staff; qualifiche interne configurabili | TNT Owner | APPROVED |
| Q-TNT-004 | Turni e presenza | M6 | Supportarli, ma non imporre regole fino a conferma post-wipe | TNT/HR Owner | RECOMMENDED |
| Q-TNT-005 | Convenzioni ed eventi | M6/M7 | Configurabili e disattivabili; non bloccano il vertical slice | TNT/Commercial Owner | RECOMMENDED |
| Q-TNT-006 | Integrazione con script server | M8+ | Adapter futuro; MVP manuale/app-first | Technical/TNT Owner | DEFERRED |

### Payroll

| ID | Decisione | Blocca | Default raccomandato | Owner | Stato |
|---|---|---|---|---|---|
| Q-PAY-001 | Valuta e precisione | M5 | Valuta/simbolo per organizzazione; importi interi salvo configurazione diversa | Finance Owner | RECOMMENDED |
| Q-PAY-002 | Timezone | M5 | Timezone organizzazione, default `Europe/Rome`; timestamp DB in UTC | Technical/Finance Owner | RECOMMENDED |
| Q-PAY-003 | Base commissione personale | M5 | Solo vendite chiuse e incassate; annulli/rimborsi rettificati nel periodo successivo | Finance Owner | RECOMMENDED |
| Q-PAY-004 | Formula TNT iniziale | M5/M6 | Fisso + percentuale personale + bonus; pool aziendale supportato ma disattivato finché non definito | TNT/Finance Owner | RECOMMENDED |
| Q-PAY-005 | Regola pool aziendale | M5 | Definire base, aliquota e distribuzione; nessun default automatico | Product/Finance Owner | OPEN |
| Q-PAY-006 | Periodo standard | M5 | Settimanale configurabile; chiusura, review e pagamento separati | Finance Owner | RECOMMENDED |
| Q-PAY-007 | Arrotondamenti | M5 | Regola esplicita per organizzazione; nessun floating point nei calcoli monetari | Finance/Technical Owner | RECOMMENDED |
| Q-PAY-008 | Anticipi e trattenute RP | M5 | Solo componenti autorizzati, visibili e auditati; nessuna trattenuta automatica opaca | Finance Owner | RECOMMENDED |
| Q-PAY-009 | Soglia doppia approvazione | M5 | Configurabile per importo e azione; obbligatoria per riapertura periodo e modifica formule | Product/Finance Owner | RECOMMENDED |
| Q-PAY-010 | Contestazioni | M5 | Stato `DISPUTED`, motivazione, evidenza, reviewer e rettifica versionata | HR/Finance Owner | RECOMMENDED |

### Finanza e magazzino

| ID | Decisione | Blocca | Default raccomandato | Owner | Stato |
|---|---|---|---|---|---|
| Q-FIN-001 | Conti iniziali | M4 | Cassa, banca, fondo stipendi; altri conti configurabili | Finance Owner | RECOMMENDED |
| Q-FIN-002 | Saldo di apertura | M4 | Movimento iniziale approvato e auditato | Finance Owner | RECOMMENDED |
| Q-FIN-003 | Competenza vs cassa | M4/M7 | MVP cash-first con previsto/reale separati; competenza avanzata dopo pilota | Finance Owner | RECOMMENDED |
| Q-FIN-004 | Regola margine | M4 | Ricavo netto meno costi diretti associati; formula visibile | Finance/Business Owner | RECOMMENDED |
| Q-FIN-005 | Scorte negative | M4 | Vietate di default; eccezione configurabile e auditata | Inventory Owner | RECOMMENDED |
| Q-FIN-006 | Chiusura e riconciliazione | M4 | Chiusura periodo con lock e report differenze | Finance Owner | RECOMMENDED |

### Permessi

| ID | Decisione | Blocca | Default raccomandato | Owner | Stato |
|---|---|---|---|---|---|
| Q-PERM-001 | Ruoli canonici iniziali | M2 | `ADMIN`, `DIREZIONE`, `STAFF`; ruoli specializzati dopo il pilot | Product/Security Owner | APPROVED |
| Q-PERM-002 | Visibilità Staff | M4/M5 | Propri turni, lavori, obiettivi, fatturato e prospetti; nessuna finanza generale o stipendio altrui | HR/Security Owner | APPROVED |
| Q-PERM-003 | Accesso staff server | M6 | Read-only opzionale e limitato a record concordati | Product/Security Owner | RECOMMENDED |
| Q-PERM-004 | Separazione sedi | M4 | Scope per sede/reparto oltre al ruolo | Security/Business Owner | RECOMMENDED |
| Q-PERM-005 | Export completi | M2 | Admin tecnico con approvazione o Direzione autorizzata; audit e minimizzazione dati | Security Owner | RECOMMENDED |

## Decisioni P2/P3 — dopo il pilota

| ID | Decisione | Momento | Default raccomandato | Stato |
|---|---|---|---|---|
| Q-ADV-001 | Prestiti con interesse e piani complessi | M7 | Attivare solo dopo stabilità finanza base | DEFERRED |
| Q-ADV-002 | ROI investimenti avanzato | M7 | KPI configurabili, niente predizione automatica | DEFERRED |
| Q-ADV-003 | Scritture da Discord | M8 | Read-only e notifiche prima; write actions dopo threat review | DEFERRED |
| Q-ADV-004 | Template hospitality/casinò | M10 | Derivare dal core validato, non duplicare TNT | DEFERRED |
| Q-ADV-005 | Marketplace/template library | M10+ | Valutare solo dopo almeno due verticali reali | DEFERRED |
| Q-ADV-006 | Analytics avanzati | M10+ | KPI descrittivi prima di scoring o previsioni | DEFERRED |

## Ordine di decisione immediato

1. Technical Owner e accesso nominativo al progetto Supabase Button.
2. Inventario autorizzato di schema, RLS, Auth, Storage e funzioni.
3. Backup completo e prova restore isolata.
4. Approvazione della lista delle funzioni Button da proteggere.
5. Definizione dei dati Button da migrare.
6. Parity formale tra app Button e Manuale Operativo GTA RP.
7. Strategia repository e ambienti.
8. Completamento RACI e soglie di doppia approvazione.
9. Approvazione MVP cut line.
10. Approvazione o rinvio delle proposte del manuale per il prossimo wipe.
11. Regole payroll iniziali.
12. Vertical slice business.
13. Processi TNT post-wipe.

La decisione iniziale su ruoli e visibilità è chiusa: `ADMIN`, `DIREZIONE`, `STAFF`. Il recupero dell'HTML live è completato; il gate M0 resta aperto sul backend e sulla resilienza.

## Processo di approvazione

Ogni decisione approvata deve:

1. diventare una voce in `27_DECISION_LOG.md`;
2. aggiornare requisiti e task;
3. aggiornare modello dati e test;
4. essere assegnata a una milestone;
5. indicare owner, data ed efficacia;
6. riportare eventuale impatto su migrazione, sicurezza e scope;
7. chiudere o aggiornare la relativa voce in questo documento.
