# supabase/

Pacchetto di staging: migrazioni, rollback, seed e test SQL.

> **Nulla qui dentro è stato applicato ad alcun database.**
> È materiale pronto e revisionabile, destinato a un progetto Supabase di
> **staging** dedicato. Vedi
> [../docs/STAGING_DEPLOYMENT_RUNBOOK.md](../docs/STAGING_DEPLOYMENT_RUNBOOK.md).

## Contenuto

| Percorso | Applicato dal runner | Descrizione |
|---|---|---|
| `migrations/202607280000_application_schema.sql` | ✅ sì | Schema applicativo canonico: le 14 tabelle |
| `migrations/202607280001_secure_access.sql` | ✅ sì | Accesso negato per impostazione predefinita |
| `migrations/202607280002_server_side_roles.sql` | ✅ sì | Ruoli applicativi lato server e policy RLS |
| `rollback/202607280001_…rollback.sql` | ❌ no | Annulla 0001 — **ripristina uno stato insicuro** |
| `rollback/202607280002_…rollback.sql` | ❌ no | Annulla 0002 — torna allo stato 0001 |
| `seed/staging_synthetic.sql` | ❌ no | Membership e record sintetici marcati TEST |
| `tests/verify_auth_uid.sql` | ❌ no | Verifica `auth.uid()` con token nativi |

I rollback vivono **fuori** da `migrations/` di proposito: un runner che
raccoglie automaticamente i file di quella cartella non deve poterli eseguire.

## Autosufficienza

Il pacchetto parte da un progetto Supabase **vuoto** e non richiede **alcun
accesso al database di produzione**: la migrazione `0000` crea lo schema
applicativo, `0001` lo mette in sicurezza, `0002` vi applica il modello di
ruoli.

`0000` è stata ricavata da uno snapshot offline verificato e confrontata per
hash strutturale con la sorgente. Provenienza, metodo di sanitizzazione,
oggetti inclusi ed esclusi, test su database vuoto e limitazioni sono in
[../docs/SCHEMA_BOOTSTRAP_VERIFICATION.md](../docs/SCHEMA_BOOTSTRAP_VERIFICATION.md).

Ordine obbligatorio: **0000 → 0001 → 0002**. Se lo schema manca, `0001` si
ferma con un errore esplicito che elenca le tabelle assenti.

> Fra `0000` e `0001` il database è in uno stato transitorio: le tabelle
> esistono senza policy e la piattaforma concede automaticamente privilegi ai
> ruoli client sui nuovi oggetti. Applicare `0001` subito dopo e non esporre il
> progetto in quell'intervallo.

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
