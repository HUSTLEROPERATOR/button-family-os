# 07 — TNT Automotive pilot

## Obiettivo pilota

Validare il Business Operations OS attraverso una settimana completa di gestione officina, mantenendo configurabili le attività che potrebbero cambiare al prossimo wipe.

## Workflow principale

```text
Richiesta cliente
→ Accettazione
→ Veicolo
→ Diagnosi
→ Preventivo
→ Approvazione
→ Assegnazione
→ Ricambi
→ Lavorazione
→ Controllo qualità
→ Consegna
→ Incasso
→ Chiusura
```

## Scheda cliente

Nominativo/personaggio, telefono, organizzazione, segmento, convenzioni, note autorizzate, storico lavori, saldo/crediti e referente interno.

## Scheda veicolo

Targa, modello, proprietario, caratteristiche, note tecniche, storico interventi, allegati e restrizioni.

## Ordine di lavoro

Numero, sede, cliente, veicolo, servizio richiesto, diagnosi, preventivo, ricambi, meccanico responsabile, collaboratori, priorità, stato, tempi, prezzo, sconto, costo, margine, pagamento, controllo finale e note.

## Personale TNT

Candidato, apprendista, meccanico, meccanico senior, responsabile, HR, amministrazione e direzione. Ruoli e nomi devono essere configurabili.

## Formazione

Apertura/chiusura officina; accettazione cliente; diagnosi; preventivo; standard lavorazione; gestione ricambi; consegna; reclamo; sicurezza; comunicazione radio/Discord; gestione cassa; eventi.

## KPI pilota

- lavori aperti/chiusi;
- tempo medio chiusura;
- fatturato aziendale e personale;
- sconto medio;
- margine stimato;
- riaperture/reclami;
- produttività;
- magazzino critico;
- formazione completata;
- puntualità turni.

## Dati da confermare dopo wipe

Servizi reali, listino, ricambi, ruoli, frequenza turni, formule stipendiali, convenzioni, workflow con script del server ed eventi autorizzati. Questi dati devono stare in cataloghi configurabili, non nel codice.