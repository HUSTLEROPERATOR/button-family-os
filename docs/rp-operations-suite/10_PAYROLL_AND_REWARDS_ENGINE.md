# 10 — Payroll and rewards engine

## Obiettivo

Calcolare compensi RP in modo configurabile, trasparente, riproducibile e approvabile.

## Componenti supportati

### Fisso
`fixed_amount`

### Percentuale personale
`personal_revenue × personal_rate`

### Percentuale aziendale
`company_revenue × company_pool_rate`, distribuita in parti uguali, per ore, peso ruolo, punti performance o formula composita.

### A prestazione
Per servizio, lavoro chiuso, turno, cliente acquisito, evento, formazione o obiettivo.

### Variabili
Bonus, premi, benefit, anticipo, rettifica e trattenuta RP esplicitamente autorizzata.

## Formula ibrida

```text
gross_pay =
  fixed
  + personal_commission
  + company_pool_share
  + activity_compensation
  + bonuses
  + benefits_value
  + adjustments
  - advances_recovered
  - authorized_deductions
```

Ogni componente mostra sorgente, formula, base, aliquota/importo, risultato, approvatore e stato.

## Periodicità

Settimanale, quindicinale, mensile o intervallo personalizzato. Configurazione: timezone, giorno/ora chiusura, data calcolo, scadenza revisione, scadenza pagamento, tolleranza e responsabili.

## Workflow

```text
OPEN → FROZEN → CALCULATING → REVIEW → APPROVED → PAID
```

Eccezioni: `FAILED`, `REOPENED`, `DISPUTED`, `VOID`.

## Job automatico

- idempotency key per organizzazione/periodo;
- lock contro il doppio calcolo;
- log inizio/fine;
- gestione errori parziali;
- nessun pagamento automatico;
- notifica direzione;
- rilancio controllato.

## Approvazioni e rettifiche

Un periodo approvato non viene sovrascritto. Può essere riaperto solo da ruolo autorizzato, con motivazione, conservazione versione precedente e audit. Le correzioni diventano componenti di rettifica.

## Edge cases

Vendita annullata dopo chiusura; pagamento parziale; dipendente con più ruoli; cambio formula nel periodo; assenza fatturato; percentuali fuori limite; duplicati; cambio timezone; periodi sovrapposti; dipendente sospeso; contestazione dopo pagamento.

## Criteri di accettazione

Stesso input e stessa versione regole producono lo stesso risultato; ogni cifra è spiegabile; nessun doppio calcolo; periodo approvato bloccato; permessi rispettati; audit completo; simulazione distinta dal calcolo ufficiale; export disponibile.