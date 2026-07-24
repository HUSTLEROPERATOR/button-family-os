# 17 — Roles, permissions and audit

## Modello RBAC + scope

Il permesso deriva da organizzazione, ruolo, sede, reparto, stagione, ownership del record ed eventuale delega temporanea.

## Ruoli base

Owner, director, admin, HR, finance, manager, supervisor, employee/member, apprentice/probation, auditor e guest/partner. Ogni organizzazione può rinominarli, ma i permessi tecnici restano espliciti.

## Azioni sensibili

Gestione ruoli; accesso finanza; modifica formule stipendio; approvazione payroll; riapertura periodo; rettifica inventario; modifica sconti; prestiti; cancellazione/archiviazione; export completo; integrazioni; configurazioni.

## Audit event

Campi: attore, organizzazione, azione, entità, record, timestamp, prima/dopo sanificato, motivazione, request id, esito, approvatore e correlazione.

## Separazione dei compiti

- chi prepara payroll non dovrebbe approvarlo da solo sopra soglia;
- chi registra una rettifica inventario può richiedere approvazione;
- chi crea un prestito non ne conferma il pagamento senza controllo;
- chi modifica permessi non può cancellare l'audit.

## RLS

Policy minime: tenant isolation, membership attiva, role permission, record scope, deny by default e service role limitato.

## Access review

Revisione periodica di ruoli, account inattivi, deleghe scadute, utenti senza personaggio, permessi eccessivi, accessi anomali ed export effettuati.