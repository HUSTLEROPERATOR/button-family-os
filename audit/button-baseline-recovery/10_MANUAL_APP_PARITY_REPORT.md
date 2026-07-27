# 10 — Manuale ↔ app Button parity report

## Scopo

Confrontare la baseline live osservata di Button's Family OS con il contenuto del `GTA RP Manuale Operativo Bozza v1.0`, senza trasformare automaticamente le proposte del manuale in requisiti di parità legacy.

## Fonti

- `SRC-BUTTON-LIVE-001` — HTML live esportato il 2026-07-25, SHA-256 `16DA604373877C94FDDF0C6A4BCAF64758774ED9C55B1C57B1EADA4C747ACEDC`;
- `SRC-GTA-RP-OPS-001` — manuale operativo v1.0, stato `SOURCE_DRAFT`;
- `04_BUTTON_PARITY_CHECKLIST.md` — 21 funzioni confermate, 3 parziali, 2 sconosciute;
- `docs/rp-operations-suite/33_MANUALE_OPERATIVO_GTA_RP_INTEGRATION.md` — mapping semantico della fonte.

## Stati del confronto

- `OBSERVED` — funzione equivalente osservata nel sorgente live;
- `PARTIAL` — esiste una funzione vicina, ma manca il workflow o il controllo richiesto;
- `NOT_OBSERVED` — nessuna evidenza nel sorgente live;
- `BACKEND_UNKNOWN` — dipende da schema, RLS o funzioni non accessibili;
- `SOURCE_PROPOSED` — soglia o regola proposta dal manuale, non attiva.

## Mappatura manuale → app live

| Sezione manuale | Aspettativa | Evidenza app live | Stato | Decisione di prodotto |
|---|---|---|---|---|
| 1. Principi e buon senso | principi, regole, acknowledgement, eccezioni | nessun modulo manuali/procedure osservato | NOT_OBSERVED | nuovo modulo versionato; non è parity legacy |
| 2. Leadership e tutor | gerarchia, tutor, responsabilità formative | gerarchia ruoli drag&drop presente; tutor assente | PARTIAL | preservare ruoli; aggiungere tutoraggio |
| 3. Nuovi affiliati e prova | periodo prova, obiettivi, review, esito | stato membro `In prova`; nessun workflow probation | PARTIAL | stato legacy da preservare; workflow nuovo |
| 4. Depositi e accessi | depositi, inventario, doppio controllo, access review | depositi, movimenti e inventario presenti; access review assente | PARTIAL | preservare magazzino; aggiungere revisioni e doppia firma |
| 5. Dotazioni, outfit e veicoli | kit, outfit, mezzi, readiness | depositi tipo garage/veicolo osservati; nessun modulo readiness | PARTIAL | cataloghi e checklist nuovi |
| 6. Attività e transazioni | attività, partecipanti, risorse, denaro, divisioni | registro attività, cassa e movimenti esistono ma separati | PARTIAL | unificare tramite activity ledger senza perdere i registri esistenti |
| 7. Missioni e obiettivi | mission plan, autorizzazione, piano B, debrief | nessun modulo missioni/obiettivi strutturati | NOT_OBSERVED | nuovo modulo Organization OS |
| 8. Intelligence RP | fonte, attendibilità, verifica, visibilità | relazioni fazioni e diario intel presenti; livelli verifica assenti | PARTIAL | preservare dati; aggiungere classificazione e permessi |
| 9. Eventi e relazioni | partecipazioni, contatti, collaborazioni, voucher | relazioni fazioni presenti; eventi/voucher non osservati | PARTIAL | relazioni parity; eventi come estensione |
| 10. Quote, vantaggi e bonus | quote, cauzioni, sconti, benefit | accordi e movimenti cassa presenti; regole benefit assenti | PARTIAL | mantenere accordi; regole economiche versionate nuove |
| 11. Dubbi e cavilli | issue register, soluzione temporanea, review | nessun registro strutturato osservato | NOT_OBSERVED | nuovo workflow con review date |
| 12. Valutazioni e provvedimenti | review, correzioni, limitazioni, sospensioni | stati membro presenti; valutazioni/provvedimenti strutturati assenti | PARTIAL | preservare stati; aggiungere evidenze e decisione umana |
| 13. Punti da decidere | proposta, approvazione, efficacia, versione | impostazioni semplici presenti; approval register assente | NOT_OBSERVED | nuovo configuration approval register |
| Appendice A | checklist settimanale | nessuna checklist ricorrente osservata | NOT_OBSERVED | nuovo template ricorrente |
| Appendice B | scheda nuovo affiliato | scheda membro presente; review prova assente | PARTIAL | estendere scheda senza perdere campi legacy |
| Appendice C | problema e soluzione | nessun form equivalente | NOT_OBSERVED | nuovo form issue/decision |
| Appendice D | pianificazione missione | nessun form equivalente | NOT_OBSERVED | nuovo mission form |
| Approvazione | firma/versione/timestamp | permessi UI admin/viewer; nessuna approvazione formale | BACKEND_UNKNOWN | definire server-side in Slice 1/2 |

## Configurazioni numeriche della fonte

Le 16 proposte numeriche del manuale sono classificate `SOURCE_PROPOSED`:

- durata prova;
- target economico e varietà lavori;
- briefing, missioni, eventi e registrazioni;
- frequenza inventario e access review;
- requisiti outfit/veicoli;
- preavviso e target missioni;
- target intelligence/eventi;
- quota/cauzione;
- sconto affiliati.

Nessuna è osservata come configurazione versionata nell'app live. Non devono diventare hardcode o acceptance di parity. Richiedono decisione Direzione, organizzazione, stagione, unità, versione e data di efficacia.

## Funzioni legacy da proteggere

Le seguenti capacità appartengono alla baseline e non devono essere perse durante la futura migrazione:

1. login legacy finché il nuovo Auth non è validato;
2. elenco, ricerca e filtri membri;
3. scheda membro e stati;
4. gerarchia ruoli ordinabile;
5. registro attività;
6. prove armi;
7. vista crescita;
8. inventario e movimenti;
9. depositi;
10. accordi;
11. casse pulito/sporco per deposito;
12. relazioni fazioni;
13. diario intelligence;
14. export/import JSON e CSV controllati;
15. impostazioni wipe/conversioni;
16. gestione account e invalidazione sessioni;
17. sincronizzazione multi-dispositivo, da sostituire con un modello server-authoritative più sicuro.

## Funzioni nuove, non parity legacy

- manuali e procedure in-app;
- tutoraggio e periodo di prova strutturato;
- mission planning e debrief;
- checklist ricorrenti;
- access review;
- readiness dotazioni/outfit/veicoli;
- issue e decision register;
- valutazioni e provvedimenti versionati;
- eventi e voucher;
- quote/benefit configurabili;
- approval register;
- ruoli `ADMIN`, `DIREZIONE`, `STAFF` server-side;
- audit append-only;
- stagioni e configurazioni versionate.

## Gap di sicurezza prioritari

| Priorità | Gap | Blocco |
|---|---|---|
| P0 | permessi legacy principalmente client-side | richiede RLS/Auth reali |
| P0 | possibili scritture/cancellazioni con publishable key | richiede audit RLS B-01 |
| P0 | retention distruttiva eseguita al load | non aprire HTML live; correggere in staging |
| P0 | sync che cancella record non presenti localmente | sostituire con operazioni server-authoritative |
| P0 | backup/restore non verificati | blocca M0 |
| P1 | codice live remoto senza integrità/version pinning | versionare e rilasciare da pipeline |

## Esito ORG-023

`IN_REVIEW`

Il confronto statico è completato. Per chiudere ORG-023 servono:

- approvazione del Button Owner sulla lista delle funzioni legacy da proteggere;
- conferma Direzione su quali proposte del manuale approvare, modificare, rinviare o eliminare;
- verifica backend delle voci `BACKEND_UNKNOWN` dopo chiusura B-01;
- registrazione SHA-256 del PDF originale.

## Prossima azione

Approvare o correggere la sezione **Funzioni legacy da proteggere**. Questa decisione sblocca Q-BTN-001 e permette di definire la parity acceptance della Slice 2 senza confondere il prodotto futuro con la baseline esistente.
