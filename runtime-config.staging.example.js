/* Button's Family OS — template di configurazione runtime per lo STAGING.
 *
 * Copia questo file in `runtime-config.js` sul solo ambiente di staging e
 * sostituisci i segnaposto con i valori del progetto di staging.
 *
 *   Copy-Item runtime-config.staging.example.js runtime-config.js
 *
 * Il file `runtime-config.js` non va mai versionato: è escluso da .gitignore.
 * Questo template contiene solo segnaposto e l'applicazione li rifiuta
 * esplicitamente, quindi non può avviare l'app così com'è.
 *
 * Regole:
 *   - usare l'URL del progetto di STAGING, mai quello di produzione;
 *   - usare la chiave pubblica (publishable / anon), pensata per il browser;
 *   - non inserire mai la chiave `service_role`: l'applicazione la rileva e
 *     si rifiuta di avviarsi;
 *   - non incollare qui valori letti dalla produzione.
 */
window.BUTTON_CONFIG = {
  SUPABASE_URL: "https://STAGING-PROJECT.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "STAGING-PUBLISHABLE-KEY"
};
