# Runbook — deploy dello staging

Procedura operativa per portare il frontend sicuro e il modello di
autorizzazione su un progetto Supabase **di staging**.

> **Nessun passaggio di questo runbook tocca la produzione.**
> Se un criterio di arresto scatta, ci si ferma: non si prosegue al passo
> successivo e non si "aggiusta al volo".

**Prerequisito bloccante:** al momento non esiste uno slot Supabase libero
sul piano Free. Vedi [STAGING_CHECKLIST.md](STAGING_CHECKLIST.md) →
*Infrastructure blocker*. Il runbook è pronto ma **non eseguibile** finché il
blocco non è risolto.

**Convenzioni**

* `$STAGING_DB_URL` — stringa di connessione del progetto di staging, tenuta
  solo in locale, mai versionata.
* Ogni comando `psql` usa `--single-transaction`, così un errore annulla
  l'intero passo invece di lasciare il database a metà.
* Le migrazioni non contengono `BEGIN`/`COMMIT`: la transazione la fornisce il
  runner. Aprirne una annidata farebbe terminare in anticipo quella esterna.

---

## 1. Creare il progetto di staging

**Azione** — Dashboard Supabase → *New project*.
Nome: `button-family-os-staging`. Organizzazione: la stessa del progetto
esistente. Password del database: generata al momento, conservata in un gestore
di segreti, **mai** nel repository.

**Risultato atteso** — Progetto in stato `ACTIVE_HEALTHY`.

**Criterio di arresto** — Se la creazione richiede di mettere in pausa un altro
progetto o di attivare un piano a pagamento: **fermarsi**. Nessuna sospensione
e nessun upgrade è stato approvato.

**Rollback** — Eliminare il progetto appena creato. Nessun altro effetto.

## 2. Confermare la regione

**Azione** — Project Settings → General → *Region*.

**Risultato atteso** — `eu-central-1`, la stessa del progetto di origine.

**Criterio di arresto** — Regione diversa: fermarsi. La regione non è
modificabile dopo la creazione; va ricreato il progetto.

**Rollback** — Eliminare il progetto e ricrearlo nella regione corretta.

## 3. Registrare il project ref solo in locale

**Azione** — Annotare project ref, URL e chiave pubblica in un file locale
**non versionato** (`.env.staging`, già escluso da `.gitignore`).

**Risultato atteso** — `git status` non mostra alcun file nuovo.

**Criterio di arresto** — Se `git status` mostra il file: fermarsi e
correggere l'esclusione prima di proseguire.

**Rollback** — Eliminare il file locale.

> Non incollare mai questi valori in un file versionato, in un commit, in una
> issue o in una descrizione di PR.

## 4. Portare lo schema applicativo nel progetto di staging

**Azione** — Le migrazioni di questo pacchetto **non creano le tabelle**:
mettono in sicurezza uno schema che deve già esistere. Portare nello staging la
sola **struttura** delle 14 tabelle `public.bfos_*`, senza dati:

```bash
# Dal progetto di origine, SOLO struttura, SENZA dati e SENZA ruoli.
pg_dump --schema-only --no-owner --no-privileges \
        --schema=public "$SOURCE_DB_URL" > /tmp/schema-only.sql

# Ispezionare il file PRIMA di applicarlo: non deve contenere alcun INSERT.
grep -ci "^INSERT" /tmp/schema-only.sql    # atteso: 0

psql "$STAGING_DB_URL" --single-transaction -v ON_ERROR_STOP=1 -f /tmp/schema-only.sql
```

**Risultato atteso** — 14 tabelle `public.bfos_*` presenti, tutte vuote.

**Criterio di arresto** — Il dump contiene `INSERT`, oppure una tabella risulta
non vuota: **fermarsi ed eliminare il file**. Nessun dato di produzione deve
entrare in staging.

**Rollback** — `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` sul solo
staging, oppure eliminare e ricreare il progetto.

> Il dump viene letto dalla produzione in sola lettura. È l'unica interazione
> con il progetto di origine in tutto il runbook, ed è una lettura di struttura.

## 5. Applicare la migrazione 0001

**Azione**

```bash
psql "$STAGING_DB_URL" --single-transaction -v ON_ERROR_STOP=1 \
  -f supabase/migrations/202607280001_secure_access.sql
```

**Risultato atteso** — `NOTICE: 0001 applicata: nessun accesso di tabella per
anon, authenticated o PUBLIC.`

**Criterio di arresto** — Qualunque `ERROR`. In particolare *"Schema
applicativo assente o incompleto"* significa che il passo 4 non è riuscito:
tornare al passo 4, non forzare la migrazione.

**Rollback** — `supabase/rollback/202607280001_secure_access.rollback.sql`.
Attenzione: ripristina una configurazione **insicura** e contiene un blocco di
sicurezza da rimuovere deliberatamente. Su staging è quasi sempre preferibile
ricreare il progetto.

## 6. Applicare la migrazione 0002

**Azione**

```bash
psql "$STAGING_DB_URL" --single-transaction -v ON_ERROR_STOP=1 \
  -f supabase/migrations/202607280002_server_side_roles.sql
```

**Risultato atteso** — `NOTICE: 0002 applicata: ruoli lato server attivi,
nessun accesso anonimo.`

**Criterio di arresto** — Qualunque `ERROR`. *"0001 non risulta applicata"*
significa che il passo 5 non ha avuto effetto.

**Rollback** — `supabase/rollback/202607280002_server_side_roles.rollback.sql`.
Riporta allo stato del passo 5 senza riaprire nulla.

## 7. Configurare Supabase Auth

**Azione** — Authentication → Providers → **Email**: abilitato.
Authentication → Sign In / Providers → **disabilitare la registrazione
autonoma**. URL Configuration → *Site URL* e *Redirect URLs*: solo l'origine
di staging.

**Risultato atteso** — Provider email attivo, registrazione autonoma disattiva,
redirect limitati allo staging.

**Criterio di arresto** — Se un redirect punta a un dominio di produzione o a
un dominio non controllato: fermarsi e correggere.

**Rollback** — Disattivare il provider email.

## 8. Creare i quattro utenti sintetici

**Azione** — Authentication → Users → *Add user* → *Create new user*, con
*Auto Confirm User* attivo:

| Etichetta | Email |
|---|---|
| ADMIN_STAGING | `admin.staging@example.com` |
| DIREZIONE_STAGING | `direzione.staging@example.com` |
| STAFF_STAGING | `staff.staging@example.com` |
| NO_ROLE_STAGING | `norole.staging@example.com` |

Password generate al momento, salvate solo in `.env.staging`, mai riutilizzate.

**Risultato atteso** — 4 utenti, tutti confermati.

**Criterio di arresto** — Se si è tentati di usare un indirizzo reale o una
password già usata altrove: fermarsi. Il dominio `example.com` è riservato
dalla RFC 2606 e non può ricevere posta: è la scelta corretta.

**Rollback** — Eliminare i 4 utenti dalla dashboard.

> Gli utenti **non** vengono creati via SQL: scrivere in `auth.users` non è una
> procedura supportata e produce utenti che non riescono ad autenticarsi.

## 9. Inserire membership e dati applicativi sintetici

**Azione**

```bash
psql "$STAGING_DB_URL" --single-transaction -v ON_ERROR_STOP=1 \
  -f supabase/seed/staging_synthetic.sql
```

**Risultato atteso** — `NOTICE: Seed completato: 4 membership, tabella utenti
legacy e tabella segreti vuote.`

**Criterio di arresto** — *"Utenti Auth sintetici mancanti"*: tornare al passo
8. Se la tabella utenti legacy o quella dei segreti risultano non vuote:
**fermarsi**, significa che sono entrati dati non previsti.

**Rollback** — `DELETE FROM public.bfos_access_memberships;` e rimozione dei
record marcati `TEST`/`stg-`.

## 10. Verificare `auth.uid()` nativo

**Azione**

```bash
psql "$STAGING_DB_URL" -v ON_ERROR_STOP=1 \
  -v admin_uid="<uuid>" -v direzione_uid="<uuid>" \
  -v staff_uid="<uuid>" -v norole_uid="<uuid>" \
  -v disabled_uid="5ada0000-0000-4000-8000-00000000dead" \
  -f supabase/tests/verify_auth_uid.sql
```

Gli UUID si leggono dalla dashboard degli utenti; **non vanno scritti** in
alcun file versionato.

**Risultato atteso** — `TUTTI I TEST SUPERATI` e
`nessun adattamento pre-richiesta necessario`.

**Criterio di arresto** — *"FALLITO 1a: auth.uid() ha restituito NULL"* è il
risultato più importante da non ignorare: significa che il modello non regge
sui token nativi. **Fermarsi e riprogettare**; non introdurre alcun
adattamento pre-richiesta per farlo passare.

**Rollback** — Nessuno: il test non scrive nulla in modo permanente.

## 11. Confermare l'assenza di adattamenti

**Azione**

```sql
-- Nessuna funzione di adattamento pre-richiesta deve esistere.
SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname NOT IN ('pg_catalog','information_schema')
  AND p.proname ILIKE '%pre_request%';

-- Nessun pre-request configurato a livello di database o di ruolo.
SHOW pgrst.db_pre_request;
SELECT rolname, rolconfig FROM pg_roles WHERE rolconfig::text ILIKE '%pre_request%';
```

**Risultato atteso** — Nessuna riga; `pgrst.db_pre_request` non impostato.

**Criterio di arresto** — Se esiste un adattamento: rimuoverlo e **ripetere il
passo 10**. Un risultato positivo ottenuto grazie a un adattamento non vale.

**Rollback** — `ALTER ROLE authenticator RESET pgrst.db_pre_request;`

## 12. Creare la configurazione runtime di staging

**Azione**

```powershell
Copy-Item runtime-config.staging.example.js runtime-config.js
# sostituire i due segnaposto con URL e chiave pubblica dello staging
git status   # runtime-config.js NON deve comparire
```

**Risultato atteso** — L'applicazione parte; `git status` resta pulito.

**Criterio di arresto** — `runtime-config.js` compare fra i file non tracciati
di `git status`: fermarsi e correggere `.gitignore`.

**Rollback** — Eliminare `runtime-config.js`.

## 13. Servire il frontend statico

**Azione**

```bash
node tests/serve.mjs 8080
```

Oppure pubblicare `index.html`, `vendor/` e `runtime-config.js` su un hosting
statico **di staging**, protetto da accesso pubblico.

**Risultato atteso** — Compare la schermata di accesso. Console senza errori
critici. **Nessun** pannello di prova, **nessuna** identità sintetica visibile.

**Criterio di arresto** — Se compare la schermata *"Configurazione mancante"*:
il passo 12 non è riuscito. Se compaiono elementi di test: **fermarsi**, la
build è sbagliata.

**Rollback** — Interrompere il server o rimuovere la preview.

## 14. Verificare la matrice dei ruoli

**Azione** — Login manuale con ciascuna delle 4 identità, poi:

```bash
node scripts/validate-staging.mjs
```

**Risultato atteso**

| Identità | Legge | Scrive | Amministra | Interfaccia |
|---|---|---|---|---|
| ADMIN | ✅ | ✅ | ✅ | Operazioni complete + sezione amministrativa |
| DIREZIONE | ✅ | ✅ | ❌ | Operazioni; nessuna gestione membership |
| STAFF | ✅ | ❌ | ❌ | Sola lettura; nessun pulsante di scrittura |
| NO_ROLE | ❌ | ❌ | ❌ | Schermata di accesso non autorizzato |

Lo script deve chiudere con tutti i controlli superati.

**Criterio di arresto** — Qualunque controllo fallito, e in particolare una
scrittura riuscita da STAFF o un dato visibile a NO_ROLE: **fermarsi**. Il
modello non è corretto e non va proseguito.

**Rollback** — Correggere le policy e ripetere dal passo 6.

## 15. Revocare l'accesso anonimo residuo

> Questo passo va eseguito **solo dopo** che i passi 13 e 14 sono riusciti.
> Invertire l'ordine rende impossibile tornare al vecchio loader.

**Azione** — Le migrazioni di questo pacchetto **non concedono** alcun accesso
anonimo, quindi su uno staging costruito da qui non c'è nulla da revocare. Va
solo verificato:

```sql
SELECT count(*) AS grants FROM information_schema.role_table_grants
WHERE table_schema='public' AND table_name LIKE 'bfos\_%' AND grantee='anon';

SELECT count(*) AS policies FROM pg_policies
WHERE schemaname='public' AND tablename LIKE 'bfos\_%' AND 'anon' = ANY(roles);
```

**Risultato atteso** — Entrambi `0`.

**Criterio di arresto** — Un valore diverso da zero significa che qualcosa ha
riaperto l'accesso anonimo dopo le migrazioni: **fermarsi** e individuare
la causa prima di proseguire.

**Rollback** — Nessuno: questo passo non modifica nulla.

## 16. Ripetere i test

**Azione**

```bash
STAGING_EXPECT_ANON_REVOKED=true node scripts/validate-staging.mjs
```

**Risultato atteso** — Tutti i controlli superati, compreso quello sulla
lettura anonima della tabella asset.

**Criterio di arresto** — Qualunque regressione rispetto al passo 14.

**Rollback** — Vedi passo 14.

## 17. Creare la preview

**Azione** — Pubblicare la build statica su un'origine di staging protetta.
Aggiornare i *Redirect URLs* di Auth con l'origine della preview.

**Risultato atteso** — Preview raggiungibile solo da chi è autorizzato.
Verifica su desktop e su mobile.

**Criterio di arresto** — Preview raggiungibile pubblicamente senza controllo
di accesso: **fermarsi** e proteggerla.

**Rollback** — Rimuovere la preview.

## 18. Aprire una Draft PR

**Azione** — Aprire una PR **in stato draft** da
`feature/secure-auth-frontend` verso `main`.

Nella descrizione: cosa cambia, esito dei test, link alla preview.
**Mai**: project ref, URL, chiavi, password, UUID di utenti.

**Risultato atteso** — PR in stato *Draft*, nessun controllo automatico che
esegua un deploy.

**Criterio di arresto** — Se esiste un'automazione che deploya sulle PR:
**fermarsi** e disattivarla prima di aprire la PR.

**Rollback** — Chiudere la PR.

## 19. Nessun merge

La PR resta in draft finché il proprietario non approva esplicitamente.
Nessun merge, nessun force push, nessun merge automatico.

## 20. Nessuna produzione

Fino a qui il progetto di produzione ha subito **una sola** interazione: la
lettura in sola struttura del passo 4. Nessuna migrazione, nessun dato, nessun
utente, nessuna configurazione sono stati modificati.

Il passaggio in produzione è **fuori dal perimetro di questo runbook** e
richiede un piano separato e una approvazione esplicita.
