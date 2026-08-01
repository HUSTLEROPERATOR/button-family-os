/* Button's Family OS — configurazione runtime con client Supabase MOCK.
 * =========================================================================
 * SOLO PER TEST LOCALI. Non fa parte del build pubblico: l'applicazione carica
 * questo file solo se viene copiato nella radice come `runtime-config.local.js`,
 * che è escluso dal versionamento.
 *
 *   Copy-Item tests\mock\runtime-config.mock.js runtime-config.local.js
 *   node tests\serve.mjs
 *   → http://localhost:8080/?scenario=admin
 *
 * Nessun dato reale, nessuna credenziale, nessun token: tutto ciò che segue è
 * inventato e non corrisponde ad alcun progetto Supabase esistente.
 *
 * L'URL configurato usa il dominio riservato `.invalid` (RFC 2606): è proprio
 * questa la condizione che autorizza l'applicazione a usare CLIENT_FACTORY.
 * Con un URL di progetto reale il gancio viene ignorato, quindi questo file
 * non può far partire l'app contro dati veri nemmeno se finisse in produzione
 * per errore.
 * ========================================================================= */
(function () {
  'use strict';

  var scenarioName = new URLSearchParams(location.search).get('scenario') || 'admin';

  /* ======================================================================
   * 1. SCENARI
   * ==================================================================== */
  var IDENTITIES = {
    admin:     { id: 'mock-user-admin',     email: 'admin.mock@example.invalid',     role: 'ADMIN' },
    direzione: { id: 'mock-user-direzione', email: 'direzione.mock@example.invalid', role: 'DIREZIONE' },
    staff:     { id: 'mock-user-staff',     email: 'staff.mock@example.invalid',     role: 'STAFF' },
    norole:    { id: 'mock-user-norole',    email: 'norole.mock@example.invalid',    role: null }
  };

  var SCENARIOS = {
    /* --- autenticazione ------------------------------------------------ */
    'login-success':   { identity: 'admin' },
    'login-failure':   { identity: 'admin', signInFails: true },
    'logout':          { identity: 'admin', autoLogoutAfterEnter: true },
    'session-restore': { identity: 'direzione', restoreSession: true },

    /* --- matrice dei ruoli --------------------------------------------- */
    admin:     { identity: 'admin' },
    direzione: { identity: 'direzione' },
    staff:     { identity: 'staff' },
    'no-access': { identity: 'norole' },

    /* --- guasti --------------------------------------------------------- */
    'role-helper-unreachable': { identity: 'admin', rpcFails: 'network' },
    /* DIREZIONE può scrivere lato interfaccia: serve proprio questo per far
       emergere un rifiuto RLS lato database e verificare come viene mostrato. */
    'rls-denial':              { identity: 'direzione', writeDenied: true },
    'missing-config':          { identity: 'admin', noConfig: true }
  };

  var scenario = SCENARIOS[scenarioName];
  if (!scenario) throw new Error('Scenario sconosciuto: ' + scenarioName);
  var identity = IDENTITIES[scenario.identity];

  /* ======================================================================
   * 2. DATI SINTETICI
   * ==================================================================== */
  var TABLES = {
    bfos_roles: [
      { id: 'r1', name: 'Direzione', color: '#d4a94e', emoji: '👑', category: 'Direzione', priority: 1, description: 'Ruolo dimostrativo.', active: true },
      { id: 'r2', name: 'Operativi', color: '#8a8a94', emoji: '🧰', category: 'Membri',    priority: 2, description: 'Ruolo dimostrativo.', active: true }
    ],
    bfos_members: [
      { id: 'm1', nickDiscord: 'Membro Mock 1', rpName: 'Personaggio Mock 1', username: '', discordId: '', phone: '',
        status: 'Attivo', reliability: 'alta', specialization: 'direzione', roles: ['r1'], mainRoleId: 'r1',
        notes: '', joinDate: '2026-01-02', lastActivity: '2026-01-20', twitchLink: '', isLive: false, channel: '', avatar: '' },
      { id: 'm2', nickDiscord: 'Membro Mock 2', rpName: 'Personaggio Mock 2', username: '', discordId: '', phone: '',
        status: 'Attivo', reliability: 'media', specialization: 'guida', roles: ['r2'], mainRoleId: 'r2',
        notes: '', joinDate: '2026-01-03', lastActivity: '2026-01-19', twitchLink: '', isLive: false, channel: '', avatar: '' },
      /* Serve alla dashboard: il riquadro "Membri in prova" deve avere almeno
         una riga da mostrare, altrimenti si verifica solo lo stato vuoto. */
      { id: 'm3', nickDiscord: 'Recluta Mock', rpName: 'Personaggio Mock 3', username: '', discordId: '', phone: '',
        status: 'In prova', reliability: 'media', specialization: 'guida', roles: ['r2'], mainRoleId: 'r2',
        notes: '', joinDate: '2026-01-15', lastActivity: '2026-01-20', twitchLink: '', isLive: false, channel: '', avatar: '' }
    ],
    bfos_activities:      [{ id: 'a1', date: '2026-01-18', type: 'Lavoro', title: 'Attività mock', outcome: 'Successo', participants: ['m1'], engaged: false, loot: '' }],
    bfos_weapon_tests:    [],
    bfos_deposits:        [{ id: 'd1', name: 'Deposito Mock', type: 'Deposito', active: true }],
    bfos_movements:       [],
    bfos_agreements:      [],
    bfos_cash_movements:  [],
    bfos_factions:        [],
    bfos_intel:           [],
    bfos_settings:        [{ key: 'session_epoch', value: '1' }, { key: 'wipe_date', value: '' }]
  };

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  /* ======================================================================
   * 3. CLIENT MOCK
   *    Riproduce solo la superficie di supabase-js v2 usata dall'app.
   * ==================================================================== */
  var ERR_INVALID_CREDENTIALS = { name: 'AuthApiError', message: 'Invalid login credentials', status: 400 };
  var ERR_NETWORK             = { name: 'TypeError', message: 'Failed to fetch', status: 0 };
  /* Messaggio realistico di rifiuto RLS: l'app non deve mostrarlo mai. */
  var ERR_RLS = {
    code: '42501', status: 403,
    message: 'new row violates row-level security policy for table "bfos_members"'
  };

  function makeSession(user) {
    return {
      access_token: 'mock-access-token-not-a-jwt',
      token_type: 'bearer',
      expires_in: 3600,
      user: { id: user.id, email: user.email, aud: 'authenticated', role: 'authenticated' }
    };
  }

  function mockCreateClient() {
    var listeners = [];
    var session = scenario.restoreSession ? makeSession(identity) : null;
    var log = { rpc: [], select: [], write: [] };

    function emit(event) {
      listeners.forEach(function (cb) { setTimeout(function () { cb(event, session); }, 0); });
    }

    /* --- query builder ------------------------------------------------- */
    function query(table) {
      var op = 'select';
      var builder = {
        select: function () { op = 'select'; return builder; },
        upsert: function (rows) { op = 'upsert'; builder._rows = rows; return builder; },
        delete: function () { op = 'delete'; return builder; },
        in:  function () { return builder; },
        not: function () { return builder; },
        neq: function () { return builder; },
        eq:  function () { return builder; },
        then: function (resolve, reject) { return builder._run().then(resolve, reject); },
        _run: function () {
          if (op === 'select') {
            log.select.push(table);
            return Promise.resolve({ data: clone(TABLES[table] || []), error: null });
          }
          log.write.push(table + ':' + op);
          /* Nel mock la RLS è simulata sul lato scritture: chi non può
             scrivere riceve lo stesso errore che restituirebbe il database. */
          if (scenario.writeDenied) return Promise.resolve({ data: null, error: ERR_RLS });
          return Promise.resolve({ data: null, error: null });
        }
      };
      return builder;
    }

    return {
      __mockLog: log,
      auth: {
        onAuthStateChange: function (cb) {
          listeners.push(cb);
          /* Come la libreria reale: emette INITIAL_SESSION subito dopo la
             sottoscrizione, con la sessione ripristinata oppure null. */
          setTimeout(function () { cb('INITIAL_SESSION', session); }, 0);
          return { data: { subscription: { unsubscribe: function () { listeners = []; } } } };
        },
        getSession: function () { return Promise.resolve({ data: { session: session }, error: null }); },
        signInWithPassword: function () {
          if (scenario.signInFails) return Promise.resolve({ data: { session: null, user: null }, error: ERR_INVALID_CREDENTIALS });
          session = makeSession(identity);
          emit('SIGNED_IN');
          return Promise.resolve({ data: { session: session, user: session.user }, error: null });
        },
        signOut: function () {
          session = null;
          emit('SIGNED_OUT');
          return Promise.resolve({ error: null });
        }
      },
      from: query,
      rpc: function (fn, args) {
        log.rpc.push({ fn: fn, args: args });
        if (fn === 'bfos_current_app_role') {
          if (scenario.rpcFails === 'network') return Promise.resolve({ data: null, error: ERR_NETWORK });
          if (scenario.rpcFails === 'denied')  return Promise.resolve({ data: null, error: ERR_RLS });
          return Promise.resolve({ data: identity.role, error: null });
        }
        return Promise.resolve({ data: null, error: ERR_RLS });
      }
    };
  }

  /* ======================================================================
   * 4. CONFIGURAZIONE ESPOSTA ALL'APPLICAZIONE
   * ==================================================================== */
  if (scenario.noConfig) {
    /* Scenario "configurazione mancante": non definiamo BUTTON_CONFIG, così
       l'app deve fermarsi sulla schermata di errore esplicita. */
    window.__BFOS_SCENARIO__ = { name: scenarioName, scenario: scenario, identity: identity, client: null };
    return;
  }

  var mockClient = null;
  window.BUTTON_CONFIG = {
    SUPABASE_URL: 'https://mock-project.example.invalid',
    SUPABASE_PUBLISHABLE_KEY: 'mock-publishable-key-not-real',
    /* Gancio riservato ai test: onorato solo perché l'URL qui sopra è .invalid. */
    CLIENT_FACTORY: function () {
      mockClient = mockCreateClient();
      window.__BFOS_SCENARIO__.client = mockClient;
      return mockClient;
    }
  };
  window.__BFOS_SCENARIO__ = { name: scenarioName, scenario: scenario, identity: identity, client: null };

  /* Logout automatico dopo l'ingresso, per lo scenario "logout". */
  if (scenario.autoLogoutAfterEnter) {
    var tries = 0;
    var timer = setInterval(function () {
      if (++tries > 100) return clearInterval(timer);
      if (document.getElementById('app').classList.contains('ready')) {
        clearInterval(timer);
        App.logout();   // `App` è un const globale dello script dell'app, non window.App
      }
    }, 50);
  }
})();
