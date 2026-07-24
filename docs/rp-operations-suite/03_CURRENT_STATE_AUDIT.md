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
- procedure organizzative: rispetto, gerarchia, briefing, riservatezza, presenza e sanzioni progressive;
- idee operative: turni, candidature, onboarding, servizi, listino, magazzino, briefing e report;
- requisiti business approvati in questa documentazione.

## Gap da chiudere

- codice sorgente reale non ancora presente nel repo;
- inventario completo delle tabelle Supabase;
- mappa dei permessi esistenti;
- ownership dei dati;
- strategia ambienti;
- test baseline;
- backup/restore verificato;
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
- [ ] Elenco bug noti.
- [ ] Conferma responsabile del go/no-go.