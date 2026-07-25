# 03 — Current state audit

## Stato repository

Il repository pubblico contiene attualmente un loader `index.html` che mostra una schermata di caricamento, interroga una tabella Supabase, recupera il contenuto HTML dell'app e sostituisce il documento corrente con il contenuto ricevuto.

## Conseguenza

La codebase reale non è ancora versionata integralmente nel repository. Prima di qualsiasi evoluzione applicativa occorre:

1. esportare il contenuto applicativo attuale;
2. verificare quale versione è effettivamente in uso;
3. identificare schema dati, dipendenze, funzioni e asset;
4. creare un commit di baseline;
5. predisporre un rollback;
6. non modificare la produzione durante l'audit.

## Materiali funzionali disponibili

- Button's Family OS esistente;
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

## Classificazione della nuova fonte

| Fonte | Stato originale | Stato nel blueprint | Utilizzo |
|---|---|---|---|
| GTA RP Manuale Operativo Bozza v1.0 | bozza da valutare | `SOURCE_DRAFT` | requisiti, mapping, form e decision queue |

Le soglie e i target contenuti nella fonte non sono considerati approvati. Sono stati trasformati in configurazioni versionate e inattive finché Direzione non li approva per una specifica organizzazione e stagione.

## Gap da chiudere

- codice sorgente reale non ancora presente nel repo;
- inventario completo delle tabelle Supabase;
- mappa dei permessi esistenti;
- ownership dei dati;
- strategia ambienti;
- test baseline;
- backup/restore verificato;
- confronto tra funzioni previste dal manuale e funzioni già presenti nell'app Button;
- decisione sulle soglie numeriche del manuale per il prossimo wipe;
- categorie reali di depositi, accessi, dotazioni e informazioni riservate;
- dati TNT reali da confermare dopo il prossimo wipe;
- contratti stipendiali e criteri economici definitivi.

## Audit checklist

- [ ] Snapshot repository e commit.
- [ ] Export sorgente applicativo.
- [ ] Hash e data della versione live.
- [ ] Inventario asset.
- [ ] Inventario tabelle, viste, funzioni, trigger e policy.
- [ ] Inventario utenti/ruoli.
- [ ] Lista variabili ambiente e segreti, senza inserirli nei documenti.
- [ ] Dipendenze e licenze.
- [ ] Test accesso e recupero.
- [ ] Backup database.
- [ ] Prova restore su ambiente isolato.
- [ ] Baseline funzionale Button.
- [x] Registrazione e classificazione del Manuale Operativo GTA RP Bozza.
- [x] Mapping manuale → moduli, requisiti, entità, task e test.
- [ ] Parity check tra manuale e app Button recuperata.
- [ ] Approvazione o rinvio delle configurazioni numeriche proposte.
- [ ] Elenco bug noti.
- [ ] Conferma responsabile del go/no-go.