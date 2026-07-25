# 03 — Current state audit

## Stato repository

Il repository pubblico contiene un loader `index.html` che interroga Supabase, recupera il contenuto HTML dell'app e sostituisce il documento corrente con il contenuto ricevuto.

La Slice 0 ha ora verificato in modalità read-only che l'applicazione live è recuperabile dalla stessa GET pubblica usata dal loader. Il contenuto live è stato esportato localmente, senza eseguirlo e senza inserirlo in Git.

## Baseline applicativa recuperata

| Evidenza | Stato |
|---|---|
| Export live read-only | COMPLETATO |
| HTTP | 200, un record |
| Dimensione | 192.478 byte |
| Righe | 2.733 |
| SHA-256 | `16DA604373877C94FDDF0C6A4BCAF64758774ED9C55B1C57B1EADA4C747ACEDC` |
| Produzione modificata | NO |
| File live committato | NO — resta sotto `audit/button-baseline-recovery/exports/`, ignorato da Git |
| Manifest e inventario | versionati nel branch audit |

Riferimenti operativi:

- `audit/button-baseline-recovery/03_LIVE_SOURCE_MANIFEST.md`;
- `audit/button-baseline-recovery/04_BUTTON_PARITY_CHECKLIST.md`;
- `audit/button-baseline-recovery/RUNBOOK.md`;
- `35_SLICE_0_RECONCILIATION.md`.

## Cosa è stato confermato

- applicazione single-file HTML/CSS/JavaScript vanilla;
- nessuna dipendenza CDN osservata;
- otto tab principali: Membri, Attività, Magazzino, Casse, Intel, Ruoli, Backup e Impostazioni;
- 21 funzioni confermate, 3 parziali e 2 non verificabili senza accesso backend;
- 13 tabelle `bfos_*` referenziate staticamente;
- due RPC legacy osservate: `bfos_login` e `bfos_list_users`;
- modello legacy `admin/viewer` applicato principalmente lato client;
- presenza di operazioni `POST`/`DELETE` nel sorgente live con chiave publishable, rischio da verificare sulle policy RLS reali;
- caricamento dell'app potenzialmente distruttivo per retention e sincronizzazione: l'HTML esportato non deve essere aperto contro la produzione.

## Conseguenza architetturale

La baseline dell'app è stata recuperata, ma la baseline tecnica completa non è ancora chiusa. Mancano ancora:

1. schema effettivo del database;
2. policy RLS e privilegi reali;
3. configurazione Auth;
4. trigger, funzioni e migrazioni;
5. Storage, Edge Functions, cron e integrazioni;
6. backup completo e prova restore isolata;
7. conteggi e consistenza dei dati autorizzati;
8. ambiente staging separato.

Non si procede con migrazioni, account reali o modifiche backend finché il blocker B-01 non è chiuso.

## Materiali funzionali disponibili

- Button's Family OS esistente e baseline live recuperata;
- manuali personalizzati Button;
- template di manuali riutilizzabili;
- materiali Discord TNT;
- `GTA_RP_Manuale_Operativo_Bozza(1).pdf`, 16 pagine, integrato semanticamente in `33_MANUALE_OPERATIVO_GTA_RP_INTEGRATION.md`;
- procedure organizzative: rispetto, gerarchia, briefing, riservatezza, presenza e sanzioni progressive;
- principi di buon senso, tutoraggio e responsabilità condivisa;
- onboarding affiliati, prova, valutazioni ed esiti;
- depositi, dotazioni, veicoli operativi e controllo accessi;
- activity ledger, mission planning, debrief e intelligence RP;
- eventi, relazioni, quote, vantaggi, bonus e decisioni temporanee;
- idee operative business: turni, candidature, onboarding, servizi, listino, magazzino, briefing e report;
- requisiti business approvati in questa documentazione.

## Registro fonti

Le fonti, gli hash disponibili, lo stato di approvazione e la posizione di conservazione sono tracciati in `36_SOURCE_REGISTER.md`.

| Fonte | Stato originale | Stato nel blueprint | Utilizzo |
|---|---|---|---|
| Button live app export | applicazione in produzione | `OBSERVED_BASELINE` | parity, rischio, migrazione e test |
| GTA RP Manuale Operativo Bozza v1.0 | bozza da valutare | `SOURCE_DRAFT` | requisiti, mapping, form e decision queue |

Le soglie e i target contenuti nelle fonti in bozza non sono approvati. Restano configurazioni versionate e inattive finché Direzione non li approva per una specifica organizzazione e stagione.

## Gap da chiudere

- accesso nominativo al corretto progetto Supabase;
- Technical Owner formalizzato;
- inventario completo di schema, RLS, Auth, Storage, funzioni e integrazioni;
- ownership e classificazione dei dati;
- strategia ambienti e staging;
- backup/restore verificato;
- approvazione della lista ufficiale delle funzioni Button da proteggere;
- confronto formale tra manuale e baseline Button;
- decisione sulle soglie numeriche del manuale per il prossimo wipe;
- categorie reali di depositi, accessi, dotazioni e informazioni riservate;
- dati TNT reali da confermare dopo il prossimo wipe;
- contratti stipendiali e criteri economici definitivi.

## Audit checklist

- [x] Snapshot repository e commit di partenza.
- [x] Export sorgente applicativo in sola lettura.
- [x] Hash, dimensione e data della versione live.
- [x] Inventario statico dell'app e degli asset inline osservabili.
- [ ] Inventario Storage e asset backend.
- [ ] Inventario tabelle, viste, funzioni, trigger e policy dal progetto.
- [ ] Inventario utenti/ruoli reali e configurazione Auth.
- [ ] Lista variabili ambiente e segreti, senza inserirne i valori nei documenti.
- [x] Dipendenze applicative osservabili dal file live.
- [ ] Licenze e dipendenze backend complete.
- [x] Test accesso e recupero read-only.
- [ ] Backup database e Storage.
- [ ] Prova restore su ambiente isolato.
- [x] Prima baseline funzionale Button documentata.
- [ ] Approvazione formale della parity baseline.
- [x] Registrazione e classificazione del Manuale Operativo GTA RP Bozza.
- [x] Mapping manuale → moduli, requisiti, entità, task e test.
- [ ] Parity formale tra manuale e app Button recuperata.
- [ ] Approvazione o rinvio delle configurazioni numeriche proposte.
- [x] Primo elenco rischi e debito tecnico osservato.
- [ ] Conferma responsabile del go/no-go.
