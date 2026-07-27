# 16 — Discord integration

## Principio

Discord è il livello di comunicazione. L'app è la fonte ufficiale dei dati.

## Casi d'uso

Briefing giornaliero; reminder turni; lavori urgenti; magazzino critico; ordine ricevuto; stipendio da approvare; pagamento in scadenza; evento imminente; imprevisto critico; recap serale/settimanale; link a procedure.

## Azioni iniziali ammesse

- invio notifiche;
- creazione thread con link record;
- comandi read-only;
- raccolta richiesta semplice da confermare nell'app;
- acknowledgment.

## Azioni da rinviare

- scrittura economica completa da messaggio libero;
- pagamento;
- modifica permessi;
- cancellazione;
- approvazione ad alto rischio senza conferma forte;
- import automatico di messaggi non strutturati.

## Canali suggeriti

`#briefing`, `#turni`, `#lavori`, `#magazzino`, `#amministrazione`, `#eventi`, `#procedure`, `#alert-direzione`, `#log-bot`. I nomi reali restano configurabili.

## Requisiti tecnici

Mapping server/canale/organizzazione; allowlist canali; permessi minimi; token fuori repo; rate limit; retry; idempotenza; log consegna; sanitizzazione; messaggi senza dati eccessivi; link autenticati.

## Flusso

```text
Domain event
→ Notification rule
→ Delivery queue
→ Discord adapter
→ Message/thread
→ Delivery status
```

## Controlli

Nessun segreto nei log; nessun dato riservato in canali pubblici; retry senza duplicazione; disattivazione integrazione senza bloccare l'app; audit comandi sensibili; gestione bot offline.