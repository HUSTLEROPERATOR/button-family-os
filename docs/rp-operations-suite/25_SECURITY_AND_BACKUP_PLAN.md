# 25 — Security and backup plan

## Threat model iniziale

Asset: identità, ruoli, dati economici RP, stipendi, clienti, procedure, allegati, token Discord, chiavi Supabase e audit.

Minacce: accesso cross-tenant, escalation, token leakage, modifica retroattiva, doppio job, export non autorizzato, perdita dati, abuso integrazione e log sensibili.

## Contromisure

- RLS deny-by-default;
- least privilege;
- service role solo server-side;
- segreti in secret manager;
- MFA direzione dove disponibile;
- audit;
- rate limit;
- idempotenza;
- validazione input;
- signed URLs;
- retention;
- dependency scanning;
- advisor security/performance;
- revisione periodica accessi.

## Backup

Definire frequenza, retention, cifratura, owner, luogo, dati inclusi, storage, export configurazioni e runbook restore.

## Restore drill

- ambiente isolato;
- tempo inizio/fine;
- RPO/RTO misurati;
- verifica conteggi;
- verifica auth;
- verifica allegati;
- verifica audit;
- firma esito;
- azioni correttive.

## Privacy operativa

Minimizzazione; note strettamente necessarie; nessun dato reale non necessario; separazione OOC/IC; log sanitizzati; export controllati; cancellazione/archiviazione secondo policy.

## Incident response

```text
DETECT → CONTAIN → ASSESS → RECOVER → NOTIFY → REVIEW
```

Ogni incidente registra impatto, dati, utenti, timeline, azioni e prevenzione.