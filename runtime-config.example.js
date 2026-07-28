/* Button's Family OS — template di configurazione runtime.
 *
 * Copia questo file in `runtime-config.js` (per il deploy) oppure in
 * `runtime-config.local.js` (per lo sviluppo locale, ha la precedenza) e
 * sostituisci i segnaposto con i valori del progetto Supabase di destinazione.
 *
 * Nessuno dei due file va versionato: entrambi sono esclusi da .gitignore.
 * Questo template contiene solo segnaposto e l'applicazione li rifiuta
 * esplicitamente, quindi non può essere usato per avviare l'app così com'è.
 *
 * SUPABASE_PUBLISHABLE_KEY è la chiave pubblica (publishable / anon): è
 * pensata per stare nel browser ed è inefficace senza policy RLS permissive.
 * La chiave `service_role` NON va mai messa qui né in nessun altro file
 * servito al browser: l'applicazione rifiuta di avviarsi se la rileva.
 */
window.BUTTON_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "YOUR-PUBLISHABLE-KEY"
};
