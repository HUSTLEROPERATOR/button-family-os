# Migrazione a frontend statico con Supabase Auth

Questo documento descrive la trasformazione del frontend di Button's Family OS
da *loader* che scarica il codice applicativo dal database a **applicazione
statica** che si autentica con **Supabase Auth** e ricava il ruolo applicativo
**dal server**.

> **Stato: nessuna modifica alla produzione.**
> Questo branch non è collegato ad alcun progetto Supabase, non contiene URL,
> chiavi o token, non esegue deploy e non modifica il database. È una proposta
> di codice da validare prima in staging.

---

## 1. Architettura precedente

```
browser → index.html (loader, ~35 righe)
            └─ fetch anonimo  GET /rest/v1/bfos_assets?key=eq.app
                 └─ document.write(contenuto)   ← l'intera applicazione
                      └─ login: RPC bfos_login(utente, password)
                           └─ ruolo "admin"/"viewer" deciso dalla risposta
```

Caratteristiche del modello:

* `index.html` conteneva URL del progetto e chiave pubblicabile in chiaro.
* Il codice dell'applicazione viveva come riga di dati nella tabella asset.
* L'aggiornamento dell'app avveniva scrivendo nel database, non nel repository.
* L'autenticazione era una funzione applicativa che confrontava una password
  conservata in una tabella dell'applicazione.
* Il ruolo era un valore restituito al client, che poi decideva da sé cosa
  mostrare e cosa scrivere.

## 2. Problemi del loader basato sulla tabella asset

| # | Problema | Conseguenza |
|---|---|---|
| 1 | L'avvio richiede una **lettura anonima** del database | Serve una policy che conceda a `anon` la lettura, cioè una superficie esposta prima di qualunque autenticazione |
| 2 | Il codice applicativo è **dato**, non sorgente | Nessuna revisione, nessuna storia, nessuna diffabilità, nessun rollback affidabile |
| 3 | `document.write` di HTML preso dal database | Chi può scrivere quella riga esegue codice arbitrario in ogni sessione |
| 4 | URL e chiave **incorporati** nel file versionato | Ogni ambiente richiede una modifica del sorgente |
| 5 | Ambiente indistinguibile | Lo stesso file punta sempre allo stesso progetto |
| 6 | Autenticazione applicativa | Password confrontate lato applicazione, nessun legame con `auth.uid()` |
| 7 | Ruolo deciso dalla risposta al client | L'autorizzazione dipende da ciò che il client dichiara |

## 3. Nuovo frontend statico

```
browser → index.html          ← l'applicazione completa, versionata
            ├─ vendor/supabase-js-2.111.0.umd.js   (libreria ufficiale, locale)
            ├─ runtime-config.js                   (URL + chiave pubblica, NON versionato)
            └─ Supabase Auth → RPC bfos_current_app_role() → RLS
```

* L'applicazione è servita **per intero** da `index.html`: nessun codice viene
  scaricato dal database, quindi **l'avvio non dipende da alcuna lettura
  anonima**.
* La libreria Supabase è **versionata in `vendor/`** con impronta SHA-256
  dichiarata: nessuna CDN esterna viene contattata a runtime.
* Nel repository non esiste alcun URL di progetto né alcuna chiave.
* L'aggiornamento dell'applicazione torna a essere un commit + un deploy di
  file statici.

## 4. Supabase Auth

L'accesso usa esclusivamente la libreria ufficiale **Supabase JavaScript v2**:

| Funzione | Implementazione |
|---|---|
| Login | `supabase.auth.signInWithPassword({ email, password })` |
| Logout | `supabase.auth.signOut()` |
| Ripristino sessione | evento `INITIAL_SESSION` di `onAuthStateChange` |
| Aggiornamento token | `autoRefreshToken`, gestito dalla libreria |
| Persistenza | `persistSession`, gestita dalla libreria |
| Stato di caricamento | schermata dedicata durante verifica ruolo e caricamento dati |

Note di sicurezza:

* **Errore di autenticazione non dettagliato**: credenziali errate, account
  inesistente ed email non confermata producono lo stesso messaggio
  (`Credenziali non valide.`), così l'interfaccia non rivela quali account
  esistono.
* La **chiave pubblicabile** può stare nel browser; la chiave **`service_role`
  no**. L'applicazione ispeziona la configurazione all'avvio e **si rifiuta di
  partire** se rileva una chiave di servizio.
* La sessione è conservata dal client ufficiale nel proprio storage. Questo è
  il comportamento previsto della libreria: **l'autorizzazione non dipende da
  quel valore**, perché il ruolo viene sempre richiesto al server (§5).
* Il callback di `onAuthStateChange` non chiama altre API Supabase in modo
  sincrono: il lavoro è rimandato al task successivo per non bloccarsi sul
  lock della sessione della libreria.

Rimosso completamente: la funzione di login applicativa, la lettura della
tabella utenti applicativa, le password in chiaro, qualunque selettore di ruolo
lato client.

## 5. Ruolo applicativo dal server (M2)

Dopo il login l'applicazione chiama **una sola** funzione:

```js
const role = await supabase.rpc('bfos_current_app_role');
```

| Proprietà | Valore |
|---|---|
| Firma | `bfos_current_app_role() → text` |
| Esecuzione | `SECURITY DEFINER`, `STABLE`, `search_path` fissato |
| Ingresso | nessuno: risolve internamente su `auth.uid()` |
| Uscita | `ADMIN` · `DIREZIONE` · `STAFF` · `NULL` |
| Permessi | `EXECUTE` a `authenticated` e `service_role`; **mai** a `anon` |

Regole applicate dal client:

* sono accettati **solo** i tre valori previsti;
* **assenza di membership**, **membership disattivata** e **ruolo sconosciuto**
  sono trattati allo stesso modo: `NO_ACCESS`;
* la tabella delle membership **non viene mai letta per intero**;
* **nessun ruolo dichiarato dal client viene preso in considerazione**;
* se la funzione non è raggiungibile l'accesso **non** viene concesso: la
  sessione viene chiusa e si torna alla schermata di accesso.

## 6. Interfaccia contro RLS

> Il ruolo restituito serve **solo** a menu, pulsanti, messaggi e navigazione.
> **La sicurezza reale resta interamente nelle policy RLS.**

| Ruolo | `canWrite` | `isAdmin` | Interfaccia |
|---|---|---|---|
| `ADMIN` | ✅ | ✅ | Operazioni complete + sezione di amministrazione |
| `DIREZIONE` | ✅ | ❌ | Operazioni e scritture; nessuna gestione membership |
| `STAFF` | ❌ | ❌ | Sola lettura; nessun pulsante di scrittura |
| `NO_ACCESS` | ❌ | ❌ | Nessun dato; schermata dedicata; logout disponibile |

* Il controllo di scrittura dell'interfaccia è **`canWrite`** (ADMIN +
  DIREZIONE), coerente con le policy: `SELECT` per tutti e tre i ruoli,
  `INSERT`/`UPDATE`/`DELETE` per ADMIN e DIREZIONE.
* **`isAdmin` non è usato come controllo generale delle scritture**: è riservato
  alle sole azioni di amministrazione di sistema.
* Se le policy dovessero divergere, il database rifiuta comunque: l'interfaccia
  evita solo di proporre azioni destinate a fallire.

### Errori del database

Nessun errore del database raggiunge l'interfaccia così com'è. Un traduttore
centrale mappa codice e stato su quattro messaggi generici — non consentito,
sessione scaduta, database non raggiungibile, errore generico — e il dettaglio
resta solo in console. **Nessun frammento SQL, nome di policy o nome di tabella
viene mostrato all'utente** (verificato dal test `rls-denial`).

## 7. Rimozione del login legacy

| Elemento rimosso | Sostituito da |
|---|---|
| Modulo utente/password applicativo | Modulo email/password di Supabase Auth |
| Funzione di login applicativa | `auth.signInWithPassword()` |
| Password conservate nell'applicazione | Credenziali gestite da Supabase Auth |
| Livello `admin`/`viewer` dedotto dal client | Ruolo `ADMIN`/`DIREZIONE`/`STAFF` dal server |
| Pannello di prova con identità sintetiche | *(assente dal build pubblico; solo sotto `tests/`)* |

Le funzioni legacy `bfos_login`, `bfos_list_users` e `bfos_set_asset` **non
vengono invocate da nessuna parte** (verificato dai controlli statici). Possono
restare temporaneamente nel database, ma **devono restare non eseguibili** da
`PUBLIC`, `anon` e `authenticated`.

## 8. Gestione utenti rinviata

La vecchia schermata leggeva la tabella utenti applicativa e ne mostrava il
livello, con istruzioni per modificare le password dal Table Editor. Non è
compatibile con Supabase Auth ed è stata **rimossa per intero**.

Al suo posto, e **solo per ADMIN**, compare una sezione informativa:

> **Gestione utenti in migrazione a Supabase Auth**

senza dati e senza azioni. Inviti e creazione di utenti dal browser **non sono
implementati** e richiedono una decisione esplicita (verosimilmente una Edge
Function che usi la service key lato server, mai nel browser).

## 9. Configurazione runtime

| File | Versionato | Ruolo |
|---|---|---|
| `runtime-config.example.js` | ✅ | Template con soli segnaposto |
| `runtime-config.js` | ❌ | Configurazione reale, generata al deploy |
| `runtime-config.local.js` | ❌ | Configurazione locale (`*.local.js` è escluso) |

```js
window.BUTTON_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "YOUR-PUBLISHABLE-KEY"
};
```

All'avvio la configurazione è validata. L'applicazione **si ferma con una
schermata di errore esplicita** — e non parte in uno stato indefinito — se:

1. il file manca o non definisce la configurazione;
2. mancano URL o chiave;
3. sono ancora presenti i **segnaposto** del template;
4. l'URL non è valido;
5. l'URL non è **HTTPS**;
6. la chiave sembra una **chiave di servizio**.

Il motivo mostrato è generico e non rivela alcun valore configurato.

## 10. Requisiti per lo staging

Vedi **[STAGING_CHECKLIST.md](STAGING_CHECKLIST.md)** per la lista completa dei
gate. In sintesi: progetto di staging separato, migrazioni M1/M2 adattate e
deployabili, Supabase Auth configurato, utenti e membership **sintetici**,
configurazione runtime di staging, matrice dei ruoli verificata end-to-end,
approvazione del proprietario. **Nessun collegamento alla produzione.**

## 11. Verifica di `auth.uid()` prima dello staging

Le policy M2 sono state validate in un ambiente locale che richiedeva un
adattamento per far risolvere l'identità a partire dai claim del token. **Quel
meccanismo non è stato portato in questo branch**: il frontend pubblico usa i
JWT reali emessi da Supabase Auth.

Prima di dichiarare lo staging valido occorre verificare, con un token reale:

- [ ] `auth.uid()` restituisce l'identificativo dell'utente autenticato;
- [ ] `request.jwt.claim.sub` è coerente con `auth.uid()`;
- [ ] **non serve alcun adattamento pre-richiesta**: le policy funzionano senza;
- [ ] `bfos_current_app_role()` restituisce il ruolo atteso per ciascuna identità;
- [ ] le policy M2 sono compatibili con la versione del progetto di destinazione;
- [ ] `SELECT` riesce per tutti e tre i ruoli sulle tabelle operative;
- [ ] `INSERT`/`UPDATE`/`DELETE` riescono per ADMIN e DIREZIONE e **falliscono
      per STAFF**;
- [ ] un utente senza membership non legge nulla.

## 12. Rollback del frontend

Il rollback è puramente di file statici e **non tocca il database**:

1. ripubblicare la versione precedente di `index.html` (o ripuntare l'hosting al
   commit precedente);
2. il vecchio loader torna a funzionare **solo se** la policy di lettura anonima
   sull'asset e il relativo `GRANT` sono ancora presenti.

> Da qui la sequenza obbligata: **prima** il frontend statico va deployato e
> verificato, **poi** si revoca l'accesso anonimo (§13). Invertire i due passi
> rende il rollback impossibile.

## 13. Attività ancora necessarie sul database

Da eseguire con **migrazioni separate**, non da questo branch:

| # | Attività | Quando |
|---|---|---|
| 1 | Adattare M1/M2 a migrazioni deployabili sul progetto di destinazione | Prima dello staging |
| 2 | Creare le membership per gli utenti Auth reali | Prima del passaggio in produzione |
| 3 | Rimuovere la policy di lettura anonima sulla tabella asset (`anon_read_assets`, oggi sostituita dalla policy limitata alla sola chiave di bootstrap) | **Dopo** il deploy verificato del frontend statico |
| 4 | Revocare l'**ultimo `GRANT SELECT` a `anon`** sulla tabella asset | Insieme al punto 3 |
| 5 | Valutare la rimozione definitiva delle funzioni legacy | Dopo un periodo di osservazione |
| 6 | Decidere il modello di invito/creazione utenti | Prima di riattivare la gestione utenti |

Con il frontend statico **nessuna lettura anonima è più necessaria per
avviare l'interfaccia**: dopo il punto 4 il ruolo `anon` non ha più alcun
accesso alle tabelle applicative.

## 14. Nessuna modifica alla produzione

Questo branch:

* ✅ non contiene URL di progetto, chiavi, token o password;
* ✅ non contiene dati reali (i dati dimostrativi sono sintetici);
* ✅ non è collegato ad alcun progetto Supabase;
* ✅ non esegue deploy;
* ✅ non applica migrazioni e non modifica alcun database;
* ✅ non invoca le funzioni legacy revocate;
* ✅ non va mergiato né deployato automaticamente.

### Verifiche eseguite

| Suite | Comando | Esito |
|---|---|---|
| Controlli statici | `node tests/run-static-checks.mjs` | 74/74 |
| Test interfaccia con mock | `node tests/run-mock-tests.mjs` | 21/21 |

Nessuna delle due contatta la rete o Supabase Cloud.

### Pacchetto di staging

Le migrazioni deployabili, i rollback, il seed sintetico, il test di
`auth.uid()` e lo script di validazione end-to-end vivono in
[`supabase/`](../supabase/README.md) e `scripts/`. **Nulla è stato applicato ad
alcun database.** La procedura è in
[STAGING_DEPLOYMENT_RUNBOOK.md](STAGING_DEPLOYMENT_RUNBOOK.md); lo stato di
avanzamento e il blocco infrastrutturale in
[STAGING_CHECKLIST.md](STAGING_CHECKLIST.md).
