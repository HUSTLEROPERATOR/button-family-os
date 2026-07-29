# tests/

Verifiche locali del frontend. **Nessuna contatta la rete o Supabase Cloud** e
nessuna usa dati reali. Questa cartella non fa parte dell'artefatto pubblicato.

## Controlli statici

```bash
node tests/run-static-checks.mjs
```

Nessuna dipendenza. Verifica:

* validità sintattica del JavaScript inline e dei file `.js` versionati;
* struttura HTML di base (doctype, tag bilanciati, viewport, title);
* assenza di chiavi di servizio, JWT, token, password e chiavi pubblicabili reali;
* assenza di URL di progetto e di URL remoti non previsti;
* assenza di riferimenti di laboratorio, identità sintetiche, UUID ed email;
* assenza di invocazioni alle funzioni legacy revocate;
* assenza di lettura delle tabelle utenti e segreti;
* che l'avvio non dipenda dal caricamento del codice applicativo dal database;
* che il ruolo provenga dall'helper lato server e non da `localStorage`;
* che `.gitignore` escluda configurazioni e token locali.

Gli host ammessi nel codice pubblico sono elencati esplicitamente nello script
(`ALLOWED_HOSTS`) e sono tutti inerti a runtime.

Una sezione dedicata copre il **pacchetto di staging** (`supabase/`, `scripts/`):
struttura SQL bilanciata, assenza di project ref, chiavi, password e adattamenti
locali, indirizzi solo su domini riservati, UUID solo sintetici, nessun `GRANT`
ad `anon` nelle migrazioni e nel seed, nessuna scrittura diretta in `auth.users`,
`storage` o `realtime`, e i rollback fuori dalla cartella raccolta dal runner.

Il controllo di struttura SQL non è un parser Postgres completo — senza un
server non è possibile — ma un tokenizzatore che riconosce stringhe,
identificativi quotati, commenti e dollar-quoting e ne verifica il
bilanciamento. La validazione semantica avviene alla prima applicazione sullo
staging.

## Test dell'interfaccia con client mock

```bash
npm install playwright        # dipendenza di sviluppo, non versionata
npx playwright install chromium
node tests/run-mock-tests.mjs
```

Lo script avvia da sé il server statico, installa `tests/mock/runtime-config.mock.js`
come `runtime-config.js` (file non versionato) e ripristina lo stato precedente
al termine.

Scenari coperti:

| Scenario | Verifica |
|---|---|
| `login-success` | accesso riuscito, ruolo chiesto al server |
| `login-failure` | messaggio generico, nessun accesso |
| `admin` | ruolo, badge, permessi, sezione di amministrazione |
| `direzione` | scritture sì, gestione membership no |
| `staff` | sola lettura, nessun pulsante di scrittura |
| `no-access` | schermata dedicata, nessun dato esposto, logout disponibile |
| `logout` | ritorno alla schermata di accesso |
| `session-restore` | ripristino senza interazione |
| `role-helper-unreachable` | nessun accesso, messaggio non tecnico |
| `rls-denial` | rifiuto mostrato senza dettagli SQL |
| `missing-config` | errore esplicito, applicazione ferma |

Più: assenza di pannelli di prova, assenza di ruoli in `localStorage`/
`sessionStorage`, layout mobile a 390 px, console priva di errori critici.

## Perché il mock non può attivarsi in produzione

L'applicazione onora `BUTTON_CONFIG.CLIENT_FACTORY` **solo** se l'URL
configurato punta al dominio riservato `.invalid` (RFC 2606), che nessun
progetto Supabase reale può avere. Una configurazione di staging o di
produzione non può attivare il mock nemmeno per errore, e l'attivazione è
sempre segnalata in console.

## Server statico

```bash
node tests/serve.mjs [porta] [host]
```

Ascolta su `127.0.0.1:8080` per impostazione predefinita. Solo per sviluppo.
