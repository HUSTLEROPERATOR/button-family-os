# 00 — Executive overview

## Obiettivo

Costruire una **RP Operations Suite** composta da un nucleo condiviso e da domini distinti:

```text
RP Operations Suite
├── Shared Core
├── Organization OS
│   └── Button's Family OS
└── Business Operations OS
    ├── TNT Automotive
    ├── Locale / ristorante / nightclub
    ├── Casinò
    └── Business personalizzato
```

## Stato approvato

- Button's Family OS è già ben impostato e non deve essere ridisegnato per assomigliare a un business.
- I manuali Button restano il riferimento per governance, progressione, missioni e procedure criminali.
- Il dominio business richiede strumenti commerciali e gestionali propri.
- TNT Automotive è il primo caso pilota, non l'unico modello possibile.
- Il sistema dovrà supportare attività che cambiano con wipe e stagione.
- La configurazione deve avvenire dall'interfaccia, non attraverso modifiche ad hoc al codice.

## Risultato atteso

Una web app/PWA multi-organizzazione in cui la direzione configura il business; lo staff consulta procedure e compila attività; vendite, acquisti, magazzino, personale e finanza sono collegati; gli stipendi vengono calcolati con formule configurabili; bonus, sconti, convenzioni, eventi, sponsor, investimenti e prestiti sono tracciati; ogni modifica rilevante produce uno storico verificabile; Discord riceve notifiche e briefing collegati ai record dell'app.

## Priorità

1. Proteggere l'app Button esistente.
2. Recuperare e versionare il codice reale oggi servito da Supabase.
3. Definire modello dati, permessi e audit.
4. Costruire il Business Operations Core.
5. Validare il pilota TNT.
6. Integrare Discord solo dopo la stabilizzazione del dominio.
7. Estendere a nuovi template business.

## Condizioni di successo

- nessuna perdita di funzionalità Button;
- nessuna perdita di dati;
- formule economiche spiegabili e riproducibili;
- permessi testati;
- cambio wipe senza cancellazione dello storico;
- TNT gestibile per un intero ciclo settimanale;
- nuovo business configurabile senza fork del codice;
- rollback documentato e provato.