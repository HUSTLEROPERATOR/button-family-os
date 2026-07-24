# 12 — Inventory, purchases and sales

## Cataloghi

Servizi e prodotti devono essere versionati e separati dai manuali statici. Campi: codice, nome, categoria, unità, prezzo, costo, stato, validità, sede, requisiti e visibilità.

## Vendite

```text
DRAFT → CONFIRMED → PARTIALLY_PAID → PAID → CLOSED
```

Eccezioni: `CANCELLED`, `REFUNDED`, `DISPUTED`.

Una vendita registra cliente, responsabile, righe, quantità, listino, sconto, prezzo finale, costo, pagamento, fonte, collegamento ordine di lavoro e stagione.

## Acquisti

```text
REQUESTED → APPROVED → ORDERED → PARTIALLY_RECEIVED → RECEIVED → CLOSED
```

Campi: fornitore, richiedente, approvatore, quantità, costo, data prevista, data ricevuta, stato pagamento e allegati.

## Magazzino

Movimenti: carico acquisto, scarico lavoro/vendita, trasferimento, rettifica, perdita, danneggiamento, reso, inventario e storno.

Invarianti:
- nessuna giacenza modificata direttamente;
- ogni variazione deriva da un movimento;
- motivazione obbligatoria per rettifiche;
- scorte negative vietate o esplicitamente configurate;
- quantità minima e ideale configurabili.

## Inventario periodico

1. apertura conteggio;
2. snapshot teorico;
3. conteggio reale;
4. differenze;
5. revisione;
6. approvazione rettifiche;
7. chiusura;
8. report.

## Controlli

Doppio ricevimento; acquisto senza approvazione; prezzo fuori soglia; vendita sotto minimo; sconto oltre permesso; movimento duplicato; ricambio assegnato a lavoro chiuso; articolo inattivo usato; inventario non chiuso.