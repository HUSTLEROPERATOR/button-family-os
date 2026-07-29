# Checklist di staging — frontend sicuro con Supabase Auth

Gate da superare **in ordine** prima di considerare valida una preview di
staging del branch `feature/secure-auth-frontend`.

> **Nessun gate di questa lista tocca la produzione.**
> Se un gate fallisce, ci si ferma: non si prosegue con quello successivo.

Riferimenti:
[SECURE_AUTH_FRONTEND_MIGRATION.md](SECURE_AUTH_FRONTEND_MIGRATION.md) ·
[STAGING_DEPLOYMENT_RUNBOOK.md](STAGING_DEPLOYMENT_RUNBOOK.md)

---

## Stato attuale

| Elemento | Stato |
|---|---|
| Codice frontend | **READY** |
| Schema applicativo (0000) | **READY** — verificato su database vuoto, hash strutturale MATCH |
| Migrazioni sicurezza (0001, 0002) | **READY** — catena 0000→0001→0002 applicata e verificata in locale |
| Dipendenza dal database di produzione | ✅ **NESSUNA** |
| Rollback | **READY** — non applicati |
| Seed sintetico | **READY** — non applicato |
| Test `auth.uid()` | **READY** — non eseguito |
| Script di validazione | **READY** — non eseguito |
| Runbook | **READY** |
| Progetto staging | 🔴 **BLOCKED** — nessuno slot Free disponibile |
| Auth staging | **NOT STARTED** |
| Utenti sintetici | **NOT STARTED** |
| Runtime config reale | **NOT CREATED** |
| Test end-to-end cloud | **NOT RUN** |
| Deploy preview | **NOT RUN** |
| Draft PR | **NOT OPENED** |
| Produzione | ✅ **UNTOUCHED** |

## Infrastructure blocker

Lo staging cloud è **rinviato**. Il pacchetto è completo e revisionabile, ma
non applicabile.

| Fatto | Valore |
|---|---|
| Piano dell'organizzazione | Free |
| Progetti attivi | 2 |
| Limite del piano | 2 progetti attivi |
| Slot disponibili | **0** |
| Progetti in pausa | 2 (non occupano slot) |

Vincoli applicati alla decisione:

* il progetto di **produzione non è sospendibile** e occupa uno slot;
* il secondo slot è occupato da un progetto non correlato, che **non è stato
  sospeso**: la decisione spetta al proprietario e non è stata presa in
  autonomia;
* **nessuna creazione di progetto è stata tentata**;
* **nessun costo è stato richiesto né approvato**; la verifica del prezzo non è
  stata eseguita perché condizionata alla disponibilità di uno slot;
* nessuna modifica è stata apportata ad alcun progetto Supabase.

Sblocco possibile in tre modi, tutti da decidere dal proprietario: sospendere
il progetto non correlato, passare a un piano che consenta più progetti attivi,
oppure attendere. Fino ad allora restano validi i test locali: controlli
statici e test con client mock, che non contattano la rete.

> Project ref e organization ID non sono riportati in questo documento.

---

## 1. Progetto di staging

- [ ] Esiste un progetto Supabase **dedicato allo staging**, separato dalla produzione
- [ ] Il progetto non contiene alcun dato reale
- [ ] Le credenziali di staging sono distinte da quelle di produzione
- [ ] È documentato chi ha accesso al progetto di staging

## 2. Migrazioni adattate

Il pacchetto è pronto in `supabase/` ed è **autosufficiente**: parte da un
progetto vuoto e non richiede alcun accesso alla produzione.

- [x] `202607280000_application_schema.sql` — schema applicativo canonico (14 tabelle)
- [x] `202607280001_secure_access.sql` — accesso negato per impostazione predefinita
- [x] `202607280002_server_side_roles.sql` — ruoli applicativi lato server
- [x] Rollback presenti in `supabase/rollback/`, fuori dalla directory automatica
- [x] Guardie di preflight adattate: fallimento esplicito su schema inatteso
- [x] Nessun adattamento locale, nessun workaround, nessun dato, nessun segreto
- [x] **Catena 0000 → 0001 → 0002 applicata e verificata su database vuoto isolato**
- [x] Confronto strutturale con la sorgente offline: **MATCH** (hash `b1c30c0a…f44b392`)
- [x] `0000` idempotente: riapplicarla su una catena completa è un no-op
- [x] Nessuna dipendenza da `pg_dump` della produzione
- [ ] Le migrazioni sono applicate **allo staging** e a nient'altro
- [ ] Ogni rollback è stato verificato sullo staging
- [ ] `bfos_current_app_role()` esiste, con firma e permessi attesi
- [ ] `EXECUTE` sugli helper **non** è concesso ad `anon`
- [ ] Verificata la seconda regola di privilegi predefiniti della piattaforma
      (vedi [SCHEMA_BOOTSTRAP_VERIFICATION.md](SCHEMA_BOOTSTRAP_VERIFICATION.md) §9.2)

> Divergenza voluta rispetto al percorso locale: le migrazioni **non**
> concedono ad `anon` alcuna lettura di bootstrap sulla tabella asset. Il
> frontend statico non ne ha bisogno, quindi lo staging parte già nello stato
> finale, senza alcun accesso anonimo da revocare dopo.

## 3. Supabase Auth configurato

- [ ] Il provider email/password è attivo
- [ ] La conferma email è configurata coerentemente con il flusso previsto
- [ ] Le policy di password sono definite
- [ ] Gli URL di redirect sono limitati all'origine di staging
- [ ] La registrazione autonoma è **disattivata** se non prevista

## 4. Utenti sintetici

- [ ] Creati utenti Auth **sintetici**, uno per ruolo
- [ ] Creato almeno un utente **senza** membership (caso `NO_ACCESS`)
- [ ] Creato almeno un utente con membership **disattivata**
- [ ] Nessun indirizzo email reale, nessuna password riutilizzata
- [ ] Le credenziali sintetiche non sono versionate

## 5. Membership sintetiche

- [ ] Membership create per gli utenti sintetici tramite la funzione amministrativa
- [ ] Un utente per ciascuno di `ADMIN`, `DIREZIONE`, `STAFF`
- [ ] Verificato che un ruolo non previsto viene rifiutato dal vincolo
- [ ] Verificato che `is_active = false` produce `NO_ACCESS`
- [ ] Verificato che un utente **non** vede le membership altrui

## 6. Configurazione runtime di staging

- [ ] `runtime-config.js` generato da `runtime-config.example.js`
- [ ] Contiene l'URL del progetto **di staging**
- [ ] Contiene la chiave **pubblicabile**, mai la chiave di servizio
- [ ] Il file **non** è versionato (verificare `git status`)
- [ ] Verificato che l'app mostra l'errore esplicito se il file viene rimosso

## 7. Matrice dei ruoli

Verificare **nell'interfaccia** e **nel database** per ogni identità:

| Identità | Legge | Scrive | Amministra | Interfaccia |
|---|---|---|---|---|
| `ADMIN` | ✅ | ✅ | ✅ | Operazioni complete + sezione amministrativa |
| `DIREZIONE` | ✅ | ✅ | ❌ | Operazioni; nessuna gestione membership |
| `STAFF` | ✅ | ❌ | ❌ | Sola lettura; nessun pulsante di scrittura |
| senza membership | ❌ | ❌ | ❌ | Schermata di accesso non autorizzato |
| membership disattivata | ❌ | ❌ | ❌ | Schermata di accesso non autorizzato |

- [ ] Ogni riga verificata dall'interfaccia
- [ ] Ogni riga verificata anche **a livello di database**, non solo di UI
- [ ] Una scrittura di STAFF forzata via client **viene rifiutata dalle policy**
- [ ] Il rifiuto è mostrato **senza dettagli SQL**
- [ ] Nessun dato compare nella schermata di accesso non autorizzato

## 8. Rimozione dell'adattamento locale

> **Gate non superabile in locale, per costruzione.** Nell'immagine usata per
> la verifica offline `auth.uid()` ricava l'identità solo dal vecchio parametro
> per-claim e non dal JSON che PostgREST v10+ imposta: il test lo rileva e si
> ferma. Non è stato aggiunto alcun adattamento per aggirarlo. La verifica va
> fatta qui, sul progetto reale. Vedi
> [SCHEMA_BOOTSTRAP_VERIFICATION.md](SCHEMA_BOOTSTRAP_VERIFICATION.md) §9.1.

- [ ] Il frontend usa i **JWT reali** emessi da Supabase Auth
- [ ] `auth.uid()` funziona con token reali, senza adattamenti pre-richiesta
- [ ] `request.jwt.claim.sub` è coerente con `auth.uid()`
- [ ] Nessun meccanismo di adattamento locale è presente nel progetto di staging
- [ ] Le policy M2 sono compatibili con la versione del progetto di destinazione

## 9. Revoca definitiva dell'accesso anonimo

> **Solo dopo** che il frontend statico è stato deployato e verificato in
> staging: invertire l'ordine rende impossibile il rollback al loader.

- [ ] Confermato che l'interfaccia si avvia **senza** alcuna lettura anonima
- [ ] Verificato che `anon` ha **0** privilegi di tabella (runbook, passo 15)
- [ ] Verificato che esistono **0** policy per `anon`
- [ ] Verificato che l'applicazione continua a funzionare
- [ ] `STAGING_EXPECT_ANON_REVOKED=true node scripts/validate-staging.mjs` supera tutto

> Su uno staging costruito con questo pacchetto non c'è nulla da revocare:
> `202607280001` rimuove anche `anon_read_assets` e `202607280002` non ricrea
> alcuna policy anonima. Questo passo è quindi una **verifica**, non una
> modifica. Su un progetto che parte da una copia dello stato di origine,
> invece, la rimozione avviene durante `202607280001`.

## 10. Build

- [ ] `node tests/run-static-checks.mjs` supera tutti i controlli
- [ ] `node tests/run-mock-tests.mjs` supera tutti i controlli
- [ ] Nessun segreto nel commit (scansione finale)
- [ ] `git diff --check` pulito
- [ ] L'artefatto pubblicato contiene **solo** `index.html`, `vendor/` e
      `runtime-config.js`; `tests/` e `docs/` **non** vengono pubblicati

## 11. Preview

- [ ] Preview pubblicata su un'origine **di staging**, non di produzione
- [ ] La preview è protetta da accesso pubblico non voluto
- [ ] Verificata su desktop e su mobile
- [ ] Login, caricamento, logout e ripristino sessione funzionano
- [ ] Console priva di errori critici
- [ ] Nessun pannello di prova, nessuna identità sintetica visibile
- [ ] Nessun dato reale presente

## 12. Approvazione del proprietario

- [ ] Il proprietario ha rivisto la matrice dei ruoli
- [ ] Il proprietario ha approvato la gestione utenti rinviata
- [ ] Il proprietario ha approvato la sequenza di revoca dell'accesso anonimo
- [ ] È stato concordato un piano di rollback
- [ ] È stata concordata una finestra di intervento

## 13. Nessuna produzione

- [ ] Nessuna migrazione applicata alla produzione
- [ ] Nessuna chiave di produzione usata in staging
- [ ] Nessun utente reale creato
- [ ] Nessun dato di produzione copiato in staging
- [ ] Il branch **non** è stato mergiato
- [ ] Nessun deploy automatico attivo su questo branch
