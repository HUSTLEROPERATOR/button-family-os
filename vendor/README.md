# vendor/

Dipendenze di terze parti servite staticamente insieme all'applicazione.

## supabase-js-2.111.0.umd.js

| | |
|---|---|
| Pacchetto | `@supabase/supabase-js` |
| Versione | `2.111.0` |
| Build | `dist/umd/supabase.js` (UMD, non minificata) |
| Origine | `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.111.0/dist/umd/supabase.js` |
| SHA-256 | `7396012594AA6D23BB373EBC25D1080BF3672FA847C3713F756520B40FD13453` |
| Licenza | MIT |
| Globale esposto | `window.supabase` → `supabase.createClient(url, key, options)` |

### Perché è versionata invece di essere presa da una CDN

* L'applicazione è un entrypoint statico: deve poter essere servita da sola,
  senza che il browser contatti host di terze parti a runtime.
* Elimina una dipendenza esterna dal percorso di login: se la CDN non è
  raggiungibile, l'autenticazione non si interrompe.
* Rende il contenuto verificabile: la versione è fissata e l'impronta SHA-256
  è riportata qui sopra.

### Aggiornamento

```powershell
$ver = "<nuova-versione>"
Invoke-WebRequest -UseBasicParsing `
  -Uri "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@$ver/dist/umd/supabase.js" `
  -OutFile "vendor/supabase-js-$ver.umd.js"
Get-FileHash "vendor/supabase-js-$ver.umd.js" -Algorithm SHA256
```

Aggiorna poi il tag `<script>` in `index.html`, la tabella qui sopra e rimuovi
la versione precedente.
