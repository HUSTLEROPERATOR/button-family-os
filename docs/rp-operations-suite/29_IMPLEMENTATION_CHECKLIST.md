# 29 — Implementation checklist

Questo documento è il controllo operativo finale prima dell'avvio di ogni fase.

## Prima di iniziare una fase

- [ ] Scopo approvato.
- [ ] Owner nominato.
- [ ] Dipendenze completate.
- [ ] Requisiti collegati ai task.
- [ ] Criteri di accettazione definiti.
- [ ] Test pianificati.
- [ ] Rischi aggiornati.
- [ ] Ambiente corretto selezionato.
- [ ] Backup richiesto disponibile.
- [ ] Nessuna operazione remota fuori autorizzazione.

## Prima di dichiarare un task completato

- [ ] Codice o documento revisionato.
- [ ] Test eseguiti.
- [ ] Permessi verificati.
- [ ] Audit verificato, se applicabile.
- [ ] Documentazione aggiornata.
- [ ] Evidenza allegata.
- [ ] Nessuna regressione nota.
- [ ] Stato e milestone aggiornati.

## Prima del merge

- [ ] PR non contiene file fuori perimetro.
- [ ] CI verde.
- [ ] Review completata.
- [ ] Migrazioni revisionate.
- [ ] Segreti assenti.
- [ ] Release notes aggiornate.
- [ ] Piano rollback disponibile.
- [ ] Conferma esplicita al merge.

## Prima del deploy

- [ ] Staging validato.
- [ ] Backup eseguito.
- [ ] Restore drill valido.
- [ ] UAT approvata.
- [ ] Monitoring attivo.
- [ ] Owner operativo disponibile.
- [ ] Finestra di rilascio concordata.
- [ ] Conferma esplicita al deploy.

## Dopo il deploy

- [ ] Smoke test.
- [ ] Controllo errori e log.
- [ ] Controllo accessi.
- [ ] Controllo dati economici.
- [ ] Controllo job automatici.
- [ ] Comunicazione esito.
- [ ] Incident aperto se necessario.
- [ ] Review post-release pianificata.