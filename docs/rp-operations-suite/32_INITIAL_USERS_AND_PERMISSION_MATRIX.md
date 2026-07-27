# 32 — Initial users and permission matrix

## Decisione MVP

Per la prima implementazione vengono utilizzati tre profili applicativi:

1. `ADMIN` — amministrazione tecnica e configurazione;
2. `DIREZIONE` — governo operativo, economico e del personale;
3. `STAFF` — utilizzo operativo quotidiano.

I profili sono ruoli, non persone specifiche. La stessa persona può ricevere più ruoli solo quando necessario, ma ogni autorizzazione resta distinta e auditata.

## Principio fondamentale

`ADMIN` non equivale automaticamente a `DIREZIONE`.

- l'Admin governa accessi, configurazioni e funzionamento tecnico;
- la Direzione governa attività, personale, denaro RP e decisioni aziendali;
- lo Staff registra ed esegue le attività autorizzate.

Questa separazione riduce il rischio che chi configura il sistema possa anche approvare senza controllo i propri movimenti economici.

## Profili iniziali

### ADMIN

**Scopo:** mantenere configurazione, utenti, ruoli, integrazioni e struttura applicativa.

Può:

- creare, invitare, sospendere e riattivare utenti;
- assegnare i ruoli `ADMIN`, `DIREZIONE` e `STAFF` entro il proprio perimetro;
- configurare organizzazione, sede, stagione/wipe e moduli;
- configurare cataloghi, nomenclature, workflow e campi personalizzati;
- configurare integrazioni e notifiche;
- consultare audit tecnici e stato dei job;
- gestire import/export tecnico autorizzato;
- intervenire su errori applicativi secondo runbook.

Non può, per impostazione predefinita:

- approvare il proprio stipendio;
- approvare un pagamento o prestito creato da sé;
- cancellare o alterare l'audit;
- modificare retroattivamente periodi economici approvati;
- vedere note riservate HR non necessarie al supporto tecnico;
- agire come Direzione senza il ruolo aggiuntivo esplicito.

### DIREZIONE

**Scopo:** governare il business o l'organizzazione e approvare le decisioni sensibili.

Può:

- vedere dashboard aziendale completa;
- gestire organigramma operativo, reparti e responsabilità;
- approvare assunzioni, promozioni, sospensioni e cessazioni;
- approvare listini, sconti straordinari e convenzioni;
- approvare acquisti e rettifiche inventariali sopra soglia;
- consultare vendite, costi, cassa, margini, budget e scadenze;
- configurare o approvare formule stipendiali;
- simulare, revisionare, approvare, riaprire e chiudere periodi paga secondo policy;
- approvare bonus, premi, anticipi e rettifiche;
- approvare eventi, sponsor, pubblicità, investimenti e prestiti;
- vedere report, audit economico e performance aggregate;
- archiviare la stagione dopo le chiusure richieste.

Non può, per impostazione predefinita:

- modificare policy RLS o segreti;
- cancellare audit;
- accedere al pannello tecnico globale;
- approvare da sola una propria operazione sopra la soglia di doppia approvazione;
- sovrascrivere dati economici chiusi senza riapertura versionata.

### STAFF

**Scopo:** svolgere e registrare le attività quotidiane con un'interfaccia semplice.

Può:

- consultare procedure, formazione, comunicazioni e listino attivo;
- vedere i propri turni, obiettivi, competenze e formazione;
- vedere i propri lavori e quelli del reparto quando autorizzato;
- creare o aggiornare clienti nei campi consentiti;
- aprire preventivi o ordini di lavoro;
- registrare diagnosi, attività, ricambi utilizzati e note operative;
- registrare vendita e pagamento entro soglie e workflow;
- segnalare necessità di acquisto, scorta critica o imprevisto;
- proporre bonus, sconti, eventi o azioni correttive senza approvarli;
- consultare fatturato personale e prospetto stipendiale personale;
- aprire una contestazione sul proprio prospetto;
- caricare allegati relativi alle attività autorizzate.

Non può:

- vedere stipendi o performance individuali altrui;
- vedere finanza aziendale completa;
- modificare formule stipendiali;
- approvare payroll, prestiti, investimenti o acquisti sensibili;
- modificare ruoli e permessi;
- cancellare vendite, movimenti o audit;
- applicare sconti oltre la propria soglia;
- vedere note HR riservate o configurazioni tecniche.

## Matrice permessi MVP

Legenda:

- `FULL` — lettura, creazione, modifica e azioni consentite;
- `APPROVE` — lettura completa e approvazione, con vincoli di separazione dei compiti;
- `OWN` — solo record propri o assegnati;
- `LIMITED` — operazioni entro soglia/configurazione;
- `READ` — sola lettura;
- `NONE` — nessun accesso.

| Modulo/Azione | ADMIN | DIREZIONE | STAFF |
|---|---|---|---|
| Accesso alla propria organizzazione | FULL | FULL | FULL |
| Configurazione organizzazione/sedi/wipe | FULL | APPROVE | NONE |
| Utenti e inviti | FULL | READ/REQUEST | NONE |
| Assegnazione ruoli | FULL | APPROVE/REQUEST | NONE |
| Policy tecniche, integrazioni e job | FULL | READ | NONE |
| Audit tecnico | FULL | READ | NONE |
| Audit economico/operativo | READ | FULL | OWN |
| Manuali e procedure | FULL | FULL | READ |
| Personale e onboarding | TECHNICAL | FULL | OWN |
| Turni | SUPPORT | FULL | OWN/LIMITED |
| Clienti | SUPPORT | FULL | LIMITED |
| Fornitori | SUPPORT | FULL | READ/REQUEST |
| Cataloghi e listini | FULL/CONFIG | APPROVE | READ |
| Preventivi | SUPPORT | FULL | LIMITED |
| Ordini di lavoro | SUPPORT | FULL | OWN/LIMITED |
| Vendite | SUPPORT | FULL | OWN/LIMITED |
| Pagamenti e rimborsi | SUPPORT | APPROVE | LIMITED |
| Acquisti | SUPPORT | APPROVE | REQUEST |
| Magazzino | SUPPORT | FULL/APPROVE | LIMITED |
| Rettifiche inventario | TECHNICAL_SUPPORT | APPROVE | REQUEST |
| Cassa e conti | TECHNICAL_SUPPORT | FULL | OWN/READ_LIMITED |
| Fatturato aziendale | READ_IF_GRANTED | FULL | NONE |
| Fatturato personale | READ_IF_SUPPORT | FULL | OWN |
| Formule stipendiali | CONFIG_WITH_APPROVAL | FULL/APPROVE | NONE |
| Simulazione payroll | SUPPORT | FULL | NONE |
| Approvazione payroll | NONE per default | APPROVE | NONE |
| Prospetti stipendiali | SUPPORT_SANITIZED | FULL | OWN |
| Bonus e premi | CONFIG | APPROVE | REQUEST |
| Sconti personale | CONFIG | APPROVE | READ_OWN |
| Convenzioni clienti | CONFIG | APPROVE | READ |
| Eventi | SUPPORT | APPROVE/FULL | REQUEST/LIMITED |
| Sponsor e pubblicità | SUPPORT | APPROVE/FULL | REQUEST |
| Investimenti e prestiti | TECHNICAL_SUPPORT | APPROVE/FULL | NONE |
| Imprevisti | SUPPORT | FULL | CREATE/OWN |
| Export completo | TECHNICAL_WITH_APPROVAL | APPROVE | NONE |
| Backup e restore | FULL secondo runbook | REQUEST/APPROVE | NONE |

## Soglie e doppia approvazione

Le soglie sono configurabili per organizzazione. Nel modello iniziale richiedono sempre audit e, quando previsto, un secondo approvatore:

- assegnazione o rimozione del ruolo `ADMIN`;
- riapertura di un periodo paga approvato;
- modifica retroattiva di formule o cataloghi;
- bonus, sconti, acquisti, prestiti o rettifiche sopra soglia;
- export completo dei dati;
- restore o operazione distruttiva;
- approvazione di un movimento creato dallo stesso utente.

## Profili demo per staging

In staging devono esistere tre account di test, senza credenziali nel repository:

| Alias | Ruolo | Dataset |
|---|---|---|
| `demo-admin` | ADMIN | configurazione e audit tecnico |
| `demo-direzione` | DIREZIONE | dati economici e approvazioni |
| `demo-staff` | STAFF | attività operative e dati personali |

Le password o magic link vengono generati nell'ambiente di staging e conservati fuori da GitHub.

## Test obbligatori

### ADMIN

- può invitare e assegnare ruoli;
- non può approvare il proprio payroll senza Direzione;
- non può cancellare audit;
- non accede a note HR non necessarie.

### DIREZIONE

- vede report economici completi;
- approva payroll e operazioni sensibili;
- non modifica segreti o policy RLS;
- non sovrascrive periodi chiusi.

### STAFF

- registra un lavoro assegnato;
- vede solo il proprio prospetto;
- non vede finanza aziendale o stipendi altrui;
- non supera soglie di sconto e pagamento;
- non modifica ruoli o configurazioni.

### Cross-role

- uno Staff non può ottenere privilegi modificando richieste client-side;
- un Admin tecnico senza ruolo Direzione non può approvare movimenti economici;
- una Direzione senza ruolo Admin non può modificare configurazioni di sicurezza;
- ogni tentativo negato produce un esito verificabile senza esporre dati riservati.

## Evoluzione futura

Dopo il pilot, i tre profili possono essere estesi con ruoli specializzati come `HR`, `FINANCE`, `RESPONSABILE_REPARTO`, `APPRENDISTA` e `AUDITOR`. Questi ruoli non devono essere necessari per la prima vertical slice: il modello dati li supporta, ma l'MVP parte con tre profili comprensibili.