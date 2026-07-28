# Checklist di staging — frontend sicuro con Supabase Auth

Gate da superare **in ordine** prima di considerare valida una preview di
staging del branch `feature/secure-auth-frontend`.

> **Nessun gate di questa lista tocca la produzione.**
> Se un gate fallisce, ci si ferma: non si prosegue con quello successivo.

Riferimento: [SECURE_AUTH_FRONTEND_MIGRATION.md](SECURE_AUTH_FRONTEND_MIGRATION.md)

---

## 1. Progetto di staging

- [ ] Esiste un progetto Supabase **dedicato allo staging**, separato dalla produzione
- [ ] Il progetto non contiene alcun dato reale
- [ ] Le credenziali di staging sono distinte da quelle di produzione
- [ ] È documentato chi ha accesso al progetto di staging

## 2. Migrazioni M1/M2 adattate

- [ ] M1 (accesso negato per impostazione predefinita) è stata resa deployabile
- [ ] M2 (ruoli applicativi lato server) è stata resa deployabile
- [ ] Le guardie di preflight sono state adattate alla forma del progetto di staging
- [ ] Le migrazioni sono applicate **allo staging** e a nient'altro
- [ ] Ogni migrazione ha il suo rollback verificato
- [ ] `bfos_current_app_role()` esiste, con firma e permessi attesi
- [ ] `EXECUTE` sugli helper **non** è concesso ad `anon`

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

- [ ] Il frontend usa i **JWT reali** emessi da Supabase Auth
- [ ] `auth.uid()` funziona con token reali, senza adattamenti pre-richiesta
- [ ] `request.jwt.claim.sub` è coerente con `auth.uid()`
- [ ] Nessun meccanismo di adattamento locale è presente nel progetto di staging
- [ ] Le policy M2 sono compatibili con la versione del progetto di destinazione

## 9. Revoca definitiva dell'accesso anonimo

> **Solo dopo** che il frontend statico è stato deployato e verificato in
> staging: invertire l'ordine rende impossibile il rollback al loader.

- [ ] Confermato che l'interfaccia si avvia **senza** alcuna lettura anonima
- [ ] Rimossa la policy di lettura anonima sulla tabella asset (`anon_read_assets`
      e la policy limitata alla sola chiave di bootstrap che l'ha sostituita)
- [ ] Revocato l'**ultimo `GRANT SELECT` ad `anon`** sulla tabella asset
- [ ] Verificato che `anon` non ha più alcun accesso ad alcuna tabella
- [ ] Verificato che l'applicazione continua a funzionare dopo la revoca
- [ ] Migrazione di revoca dotata di rollback

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
