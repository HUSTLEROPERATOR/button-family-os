# 36 — Source register

## Scopo

Registrare ogni fonte utilizzata per requisiti, parity, procedure e decisioni senza confondere materiale osservato, bozza, regola approvata o dato operativo.

## Stati fonte

- `OBSERVED_BASELINE` — comportamento o artefatto osservato e identificato;
- `SOURCE_DRAFT` — bozza integrata, non approvata come regola;
- `SOURCE_SET` — gruppo di materiali da inventariare;
- `IN_REVIEW` — fonte in classificazione o confronto;
- `APPROVED_SOURCE` — fonte approvata come riferimento normativo;
- `SUPERSEDED` — sostituita da versione successiva;
- `RETIRED` — non più utilizzata, conservata per storico.

## Registro

| Source ID | Fonte | Versione/data | Stato | Hash | Conservazione | Integrazione |
|---|---|---|---|---|---|---|
| `SRC-BUTTON-LIVE-001` | HTML live Button's Family OS recuperato dalla tabella `bfos_assets` | export 2026-07-25 | `OBSERVED_BASELINE` | `16DA604373877C94FDDF0C6A4BCAF64758774ED9C55B1C57B1EADA4C747ACEDC` | copia locale sotto `audit/button-baseline-recovery/exports/`, ignorata da Git | audit 00–09, documento 35 |
| `SRC-GTA-RP-OPS-001` | `GTA_RP_Manuale_Operativo_Bozza(1).pdf` | v1.0, 16 pagine | `SOURCE_DRAFT` | DA REGISTRARE | file originale da conservare in posizione controllata; il binario non è nella PR | documenti 33 e 34 |
| `SRC-BUTTON-MANUALS-001` | Manuali personalizzati Button | versioni multiple | `SOURCE_SET` | DA INVENTARIARE | raccolta esistente da indicizzare | Organization OS, parity e procedure |
| `SRC-NEUTRAL-MANUALS-001` | Manuali neutrali/personalizzabili per fazioni | versioni multiple | `SOURCE_SET` | DA INVENTARIARE | raccolta esistente da indicizzare | template e productizzazione |
| `SRC-TNT-DISCORD-001` | Materiali organizzativi TNT/Discord | raccolta corrente | `SOURCE_SET` | DA INVENTARIARE | Discord e documenti esportati, senza segreti | Business OS e TNT pilot |

## Campi obbligatori per nuove fonti

Ogni nuova voce deve contenere:

- Source ID stabile;
- titolo/nome file;
- autore o provenienza quando nota;
- versione o data;
- numero pagine o dimensione quando utile;
- stato;
- SHA-256 quando il file è disponibile;
- posizione di conservazione;
- classificazione dati;
- documenti/requisiti/task collegati;
- owner della review;
- eventuale fonte sostituita.

## Regole di gestione

1. Una fonte `SOURCE_DRAFT` non attiva regole, soglie o procedure.
2. Un export live non viene eseguito per verificarne il contenuto quando può produrre scritture contro la produzione.
3. File con dati utenti, segreti o metadati sensibili restano fuori dal repository pubblico.
4. Git conserva hash, manifest sanitizzati, mapping e decisioni.
5. La posizione esterna deve essere abbastanza precisa da consentire il recupero da parte dell'owner autorizzato, senza pubblicare credenziali.
6. Una nuova versione riceve un nuovo record o una nuova `source_document_version`; il vecchio hash non viene sovrascritto.
7. Una fonte approvata deve essere collegata al decision log e alla data di efficacia.

## Azioni aperte

- [ ] Calcolare SHA-256 del PDF `SRC-GTA-RP-OPS-001`.
- [ ] Registrare la posizione controllata del PDF originale.
- [ ] Inventariare i manuali Button e neutrali per versione.
- [ ] Esportare e classificare i materiali TNT/Discord senza token o dati non necessari.
- [ ] Collegare ogni fonte ai requisiti della matrice di tracciabilità.
- [ ] Nominare il Content/Source Owner.
