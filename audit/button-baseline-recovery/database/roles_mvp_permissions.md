# Roles MVP — permessi ADMIN / DIREZIONE / STAFF

Derivato da `docs/rp-operations-suite/32_INITIAL_USERS_AND_PERMISSION_MATRIX.md`
(fonte normativa), DEC-014/015/016. Questo file è il riferimento operativo per il
template `roles_mvp_seed_template.sql` e per i test RLS di Slice 1.

## Matrice sintetica

Legenda: `FULL` lettura+scrittura+azioni · `APPROVE` lettura completa e approvazione
· `OWN` solo record propri/assegnati · `LIMITED` entro soglia/config · `READ` sola
lettura · `NONE` nessun accesso.

| Area | ADMIN | DIREZIONE | STAFF |
|---|---|---|---|
| Configurazione org/sedi/wipe | FULL | APPROVE | NONE |
| Utenti, inviti, ruoli | FULL | APPROVE/REQUEST | NONE |
| Policy tecniche/integrazioni | FULL | READ | NONE |
| Audit tecnico | FULL | READ | NONE |
| Audit economico/operativo | READ | FULL | OWN |
| Personale e onboarding | supporto tecnico | FULL | OWN |
| Turni | supporto | FULL | OWN/LIMITED |
| Clienti | supporto | FULL | LIMITED |
| Preventivi/ordini di lavoro/vendite | supporto | FULL | OWN/LIMITED |
| Pagamenti e rimborsi | supporto | APPROVE | LIMITED |
| Acquisti e rettifiche inventario | supporto | APPROVE | REQUEST |
| Cassa e conti | supporto tecnico | FULL | OWN/READ_LIMITED |
| Fatturato aziendale | READ se concesso | FULL | NONE |
| Fatturato personale | supporto | FULL | OWN |
| Formule stipendiali | config con approvazione | FULL/APPROVE | NONE |
| **Approvazione payroll** | **NONE (default)** | **APPROVE** | **NONE** |
| Prospetti stipendiali | supporto sanitizzato | FULL | OWN |
| Bonus/sconti/convenzioni | config | APPROVE | REQUEST/READ |
| Investimenti e prestiti | supporto tecnico | APPROVE/FULL | NONE |
| Export completo | con approvazione | APPROVE | NONE |
| Backup e restore | FULL da runbook | REQUEST/APPROVE | NONE |

## Operazioni consentite (sintesi per ruolo)

**ADMIN** — gestione utenti e inviti; assegnazione ruoli (ADMIN con doppia
approvazione); configurazione organizzazione, stagioni/wipe, cataloghi, workflow,
integrazioni e notifiche; audit tecnico; import/export tecnico autorizzato;
interventi da runbook.

**DIREZIONE** — dashboard completa; organigramma e HR (assunzioni, promozioni,
sospensioni, cessazioni); approvazione listini, sconti, convenzioni, acquisti e
rettifiche sopra soglia; lettura completa finanza; formule stipendiali; ciclo
payroll (simula, revisiona, approva, riapre versionato, chiude); bonus, anticipi,
eventi, sponsor, investimenti, prestiti; archiviazione stagione.

**STAFF** — consultazione procedure/formazione/listino; propri turni, obiettivi,
lavori (e del reparto se autorizzato); clienti nei campi consentiti; apertura
preventivi/ordini; registrazione diagnosi, attività, ricambi, vendite e pagamenti
entro soglia; segnalazioni (acquisti, scorte, imprevisti); proposte senza
approvazione; proprio fatturato e prospetto; contestazione del proprio prospetto;
allegati sulle attività autorizzate.

## Operazioni negate (esplicite)

**ADMIN**: approvare il proprio stipendio; approvare pagamenti/prestiti creati da
sé; cancellare o alterare audit; modificare retroattivamente periodi approvati;
leggere note HR riservate non necessarie; agire come Direzione senza ruolo
esplicito.

**DIREZIONE**: modificare policy RLS o segreti; cancellare audit; pannello tecnico
globale; auto-approvarsi sopra soglia di doppia approvazione; sovrascrivere dati
economici chiusi senza riapertura versionata.

**STAFF**: stipendi/performance altrui; finanza aziendale completa; formule
stipendiali; approvazioni (payroll, prestiti, investimenti, acquisti sensibili);
ruoli e permessi; cancellare vendite/movimenti/audit; sconti oltre soglia; note HR
riservate; configurazioni tecniche.

## Ownership scope

- `OWN` per STAFF significa: record creati dall'utente **oppure** a lui assegnati
  (lavori, turni, prospetti, contestazioni, allegati). L'estensione al reparto è
  una concessione esplicita, non il default.
- Tutti i permessi sono scopati per `organization_id`: nessun ruolo attraversa i
  tenant. ADMIN amministra solo il proprio perimetro organizzativo.
- Il modello è **deny-by-default**: ciò che la matrice non concede è negato.

## Azioni che richiedono approvazione (doppia firma dove indicato)

1. Assegnazione o rimozione del ruolo `ADMIN` (secondo approvatore).
2. Riapertura di un periodo paga approvato (versionata + doppia approvazione).
3. Modifica retroattiva di formule o cataloghi.
4. Bonus, sconti, acquisti, prestiti o rettifiche sopra soglia.
5. Export completo dei dati.
6. Restore o operazione distruttiva.
7. Approvazione di un movimento creato dallo stesso utente (mai in autonomia).

## Test RLS necessari (Slice 1)

| # | Test | Atteso |
|---|---|---|
| 1 | ADMIN invita utente e assegna ruolo STAFF | consentito + audit |
| 2 | ADMIN tenta approvazione payroll senza ruolo DIREZIONE | negato |
| 3 | ADMIN tenta DELETE su audit | negato |
| 4 | ADMIN legge note HR riservate | negato |
| 5 | DIREZIONE legge report economici completi | consentito |
| 6 | DIREZIONE approva payroll (non proprio) | consentito + audit |
| 7 | DIREZIONE modifica policy RLS/segreti | negato |
| 8 | DIREZIONE sovrascrive periodo chiuso senza riapertura | negato |
| 9 | STAFF legge il proprio prospetto | consentito |
| 10 | STAFF legge prospetto di un collega | negato |
| 11 | STAFF legge finanza aziendale | negato |
| 12 | STAFF modifica ruoli/permessi o supera soglia sconto | negato |
| 13 | Utente di org A legge dati di org B (ogni ruolo) | negato (tenant isolation) |
| 14 | Richiesta forgiata client-side con claim elevati | negato dal server, non dalla UI |
| 15 | Ogni tentativo negato | produce esito verificabile senza esporre dati |

## Edge case utenti multi-ruolo

- **ADMIN + DIREZIONE sulla stessa persona:** consentito solo come doppia nomina
  esplicita e auditata; anche così, resta il vincolo "mai approvare una propria
  operazione sopra soglia" (serve un secondo approvatore distinto).
- **Separazione dei compiti nel piccolo team:** se una sola persona ha entrambi i
  ruoli, le azioni a doppia firma richiedono comunque un secondo utente reale; il
  sistema non deve accettare la stessa identità come primo e secondo approvatore.
- **Revoca di un ruolo:** la revoca non cancella l'audit delle azioni compiute; le
  sessioni attive vanno invalidate (equivalente moderno del kill-switch legacy).
- **STAFF promosso a DIREZIONE:** i vecchi record `OWN` restano suoi; i nuovi
  permessi valgono solo dal momento della nomina (nessun effetto retroattivo).
- **Nessuna eredità implicita:** ADMIN non contiene DIREZIONE né viceversa; STAFF
  non è un sottoinsieme automatico degli altri due. Ogni combinazione è una somma
  esplicita di grant auditati.

## Nota di confronto con l'app legacy

L'app Button live conosce solo `admin`/`viewer`, applicati **client-side** (vedi
`03_LIVE_SOURCE_MANIFEST.md`). La migrazione a Slice 1 dovrà mappare: `admin`
legacy → coppia ADMIN/DIREZIONE secondo responsabilità reale; `viewer` legacy →
STAFF o DIREZIONE read-only a seconda della persona. Nessuna mappatura automatica:
decisione per utente, registrata nel decision log.
