# supabase/

Pacchetto di staging: migrazioni, rollback, seed e test SQL.

> **Nulla qui dentro è stato applicato ad alcun database.**
> È materiale pronto e revisionabile, destinato a un progetto Supabase di
> **staging** dedicato. Vedi
> [../docs/STAGING_DEPLOYMENT_RUNBOOK.md](../docs/STAGING_DEPLOYMENT_RUNBOOK.md).

## Contenuto

| Percorso | Applicato dal runner | Descrizione |
|---|---|---|
| `migrations/202607280001_secure_access.sql` | ✅ sì | Accesso negato per impostazione predefinita |
| `migrations/202607280002_server_side_roles.sql` | ✅ sì | Ruoli applicativi lato server e policy RLS |
| `rollback/202607280001_…rollback.sql` | ❌ no | Annulla 0001 — **ripristina uno stato insicuro** |
| `rollback/202607280002_…rollback.sql` | ❌ no | Annulla 0002 — torna allo stato 0001 |
| `seed/staging_synthetic.sql` | ❌ no | Membership e record sintetici marcati TEST |
| `tests/verify_auth_uid.sql` | ❌ no | Verifica `auth.uid()` con token nativi |

I rollback vivono **fuori** da `migrations/` di proposito: un runner che
raccoglie automaticamente i file di quella cartella non deve poterli eseguire.

## Prerequisito

Le migrazioni **non creano le tabelle applicative**: mettono in sicurezza uno
schema che deve già esistere. Un progetto Supabase nuovo è vuoto, quindi lo
schema va portato prima (runbook, passo 4). Se manca, `0001` si ferma con un
errore esplicito che elenca le tabelle assenti.

## Transazioni

Le migrazioni **non contengono** `BEGIN`/`COMMIT`: la transazione la fornisce
il runner. Aprirne una annidata farebbe terminare in anticipo quella esterna,
lasciando il database a metà.

```bash
psql "$STAGING_DB_URL" --single-transaction -v ON_ERROR_STOP=1 \
  -f supabase/migrations/202607280001_secure_access.sql
```

## Differenza rispetto al percorso di validazione locale

Il modello validato in locale concedeva ad `anon` una lettura limitata alla
sola riga di bootstrap della tabella asset, perché il vecchio loader doveva
scaricare il codice dell'applicazione prima di qualunque login.

Il frontend statico ha eliminato quel vincolo. Qui `anon` **non riceve nulla**,
in nessun punto: lo staging parte già nello stato finale, senza alcun accesso
anonimo da revocare in un secondo momento.

## Cosa non c'è, deliberatamente

* nessun adattamento pre-richiesta per far risolvere l'identità: le policy
  devono funzionare con i token nativi, ed è ciò che `tests/verify_auth_uid.sql`
  serve a dimostrare;
* nessun URL, project ref, chiave, password o token;
* nessun dato reale e nessun identificativo ereditato da altri ambienti;
* nessuna scrittura diretta in `auth.users`, `storage` o `realtime`.

Verificato da `node tests/run-static-checks.mjs`, sezione *pacchetto staging*.
