# 22 — Test and acceptance plan

## Livelli

### Unit
Formule, validazioni, transizioni di stato, permessi logici, calcoli margine e payroll.

### Integration
Database, RLS, transazioni, trigger, storage, scheduled jobs e adapter.

### Contract
API, payload Discord, export, import e schema TypeScript.

### E2E
Percorsi reali da login a chiusura operazione.

### UAT
Direzione, responsabile, dipendente e apprendista.

## Percorsi critici

1. login → organizzazione → dashboard;
2. candidatura → onboarding → ruolo;
3. cliente → preventivo → lavoro → pagamento;
4. acquisto → ricezione → inventario;
5. vendita → fatturato personale;
6. chiusura periodo → payroll → approvazione → pagamento;
7. evento → budget → consuntivo;
8. prestito → rata → saldo;
9. cambio wipe → archiviazione → nuova stagione;
10. notifica Discord → record applicativo.

## Payroll golden tests

Dataset fissi con risultato atteso per fisso, percentuale personale, percentuale aziendale, formula ibrida, bonus, anticipo, annullamento vendita, cambio regola, periodo parziale, doppio job, riapertura e contestazione.

## Security tests

- accesso cross-tenant negato;
- escalation ruolo negata;
- record finanziari protetti;
- export limitato;
- audit non cancellabile;
- segreti assenti;
- link Discord autorizzati;
- input sanitizzato.

## Acceptance per TNT

Durante una settimana pilota:
- tutti i lavori sono registrabili;
- nessun doppio incasso;
- stock coerente;
- personale vede solo dati autorizzati;
- payroll spiegabile;
- report direzione leggibile;
- operazioni mobile completate senza supporto tecnico;
- anomalie documentate.

## Exit criteria release

- test P0/P1 pass;
- nessuna vulnerabilità critica/alta aperta;
- backup e restore provati;
- rollback provato;
- UAT approvata;
- documentazione aggiornata;
- monitoring attivo;
- owner operativo nominato.