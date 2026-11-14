import { faProjekt, faVerbindungBereit } from './projektwerte.js?v=20261114';

const faSpeichername = 'fa_teamzugang_neustart';
let faSitzung = null;
let faAuffrischung = null;
try { faSitzung = JSON.parse(sessionStorage.getItem(faSpeichername) || 'null'); } catch { /* gesperrter Sitzungsspeicher */ }

function faSitzungMerken(faInhalt) {
  faSitzung = faInhalt ? { access_token: faInhalt.access_token, refresh_token: faInhalt.refresh_token } : null;
  try {
    if (faSitzung) sessionStorage.setItem(faSpeichername, JSON.stringify(faSitzung));
    else sessionStorage.removeItem(faSpeichername);
  } catch { /* In diesem Fall bleibt der Zugang bis zum Neuladen im Arbeitsspeicher. */ }
}

export function faHatSitzung() { return Boolean(faSitzung?.access_token); }

async function faAnfordern(faPfad, faOptionen = {}, faGeschuetzt = true, faWiederholen = true) {
  if (!faVerbindungBereit()) throw new Error('Der Arbeitsbereich ist noch nicht mit dem neuen Projekt verbunden.');
  if (faGeschuetzt && !faHatSitzung()) throw new Error('Bitte erneut anmelden.');
  const faErgebnis = await fetch(faProjekt.datenadresse.replace(/\/$/, '') + faPfad, {
    ...faOptionen,
    headers: {
      apikey: faProjekt.oeffentlicherSchluessel,
      'Content-Type': 'application/json',
      ...(faGeschuetzt ? { Authorization: 'Bearer ' + faSitzung.access_token } : {}),
      ...(faOptionen.headers || {}),
    },
    signal: AbortSignal.timeout(20000),
  });
  if (faGeschuetzt && faErgebnis.status === 401 && faWiederholen && faSitzung?.refresh_token) {
    if (!faAuffrischung) {
      faAuffrischung = faAnfordern('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST', body: JSON.stringify({ refresh_token: faSitzung.refresh_token }),
      }, false).then(faSitzungMerken).catch((faFehler) => { faSitzungMerken(null); throw faFehler; }).finally(() => { faAuffrischung = null; });
    }
    await faAuffrischung;
    return faAnfordern(faPfad, faOptionen, faGeschuetzt, false);
  }
  const faInhalt = faErgebnis.status === 204 ? null : await faErgebnis.json().catch(() => null);
  if (!faErgebnis.ok) throw new Error(faInhalt?.message || faInhalt?.msg || faInhalt?.fehler || faInhalt?.error_description || 'Die Anfrage konnte nicht verarbeitet werden.');
  return faInhalt;
}

export async function faAnmelden(faPostfach, faPasswort) {
  const faAntwort = await faAnfordern('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email: faPostfach, password: faPasswort }) }, false);
  faSitzungMerken(faAntwort);
}
export async function faAbmelden() {
  try { if (faHatSitzung()) await faAnfordern('/auth/v1/logout', { method: 'POST' }); }
  finally { faSitzungMerken(null); }
}
export async function faPasswortAnfordern(faPostfach) {
  return faAnfordern('/auth/v1/recover?redirect_to=' + encodeURIComponent(faProjekt.webadresse + '/suge/'), { method: 'POST', body: JSON.stringify({ email: faPostfach }) }, false);
}
export async function faPasswortErsetzen(faPasswort) {
  return faAnfordern('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ password: faPasswort }) });
}
export function faRueckkehrLesen() {
  const faFragment = new URLSearchParams(location.hash.slice(1));
  if (faFragment.has('error_description')) {
    const faFehlertext = faFragment.get('error_description');
    history.replaceState(null, '', location.pathname);
    throw new Error(faFehlertext || 'Dieser Zugangslink ist nicht mehr gültig.');
  }
  if (!faFragment.get('access_token')) return false;
  faSitzungMerken({ access_token: faFragment.get('access_token'), refresh_token: faFragment.get('refresh_token') });
  history.replaceState(null, '', location.pathname);
  return ['invite', 'recovery', 'signup'].includes(faFragment.get('type'));
}
export function faFunktion(faName, faArgumente = {}) {
  if (!/^fa_[a-z_]+$/.test(faName)) throw new Error('Funktion nicht vorgesehen.');
  return faAnfordern('/rest/v1/rpc/' + faName, { method: 'POST', body: JSON.stringify(faArgumente) });
}
export async function faZeilen(faTabelle, faParameter = {}) {
  if (!/^fa_[a-z_]+$/.test(faTabelle)) throw new Error('Bereich nicht vorgesehen.');
  const faSammlung = [];
  const faAbfrage = new URLSearchParams({ select: '*', order: 'angelegt.desc', ...faParameter, limit: '1000' });
  for (let faVersatz = 0; ; faVersatz += 1000) {
    faAbfrage.set('offset', String(faVersatz));
    const faSeite = await faAnfordern('/rest/v1/' + faTabelle + '?' + faAbfrage);
    if (!Array.isArray(faSeite)) throw new Error('Unerwartetes Antwortformat.');
    faSammlung.push(...faSeite);
    if (faSeite.length < 1000) return faSammlung;
  }
}
export function faSpeichern(faArt, faWerte) { return faFunktion('fa_speichern', { p_art: faArt, p_werte: faWerte }); }
export function faEinladen(faKennung) { return faAnfordern('/functions/v1/fa-zugang-freigabe', { method: 'POST', body: JSON.stringify({ person: faKennung }) }); }

export async function faZahlungMitBelegSpeichern(faNeu) {
  const faDatei = faNeu.fa_belegdatei;
  const faWerte = { ...faNeu }; delete faWerte.fa_belegdatei;
  let faPfad = '';
  if (faDatei) {
    const faEndungen = { 'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
    if (!faEndungen[faDatei.type] || faDatei.size > 5242880) throw new Error('Bitte PDF, PNG, JPG oder WebP bis höchstens 5 MB verwenden.');
    faPfad = faWerte.kontakt + '/' + crypto.randomUUID() + '.' + faEndungen[faDatei.type];
    await faAnfordern('/storage/v1/object/fa-zahlungsbelege/' + faPfad, { method: 'POST', headers: { 'Content-Type': faDatei.type }, body: faDatei });
    faWerte.belegpfad = faPfad;
  }
  try { return await faSpeichern('zahlungseingaenge', faWerte); }
  catch (faFehler) {
    if (faPfad) await faAnfordern('/storage/v1/object/fa-zahlungsbelege', { method: 'DELETE', body: JSON.stringify({ prefixes: [faPfad] }) }).catch(() => {});
    throw faFehler;
  }
}
export async function faBelegadresse(faPfad) {
  if (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(pdf|png|jpg|webp)$/.test(faPfad)) throw new Error('Belegadresse ungültig.');
  const faSignatur = await faAnfordern('/storage/v1/object/sign/fa-zahlungsbelege/' + faPfad, { method: 'POST', body: JSON.stringify({ expiresIn: 60 }) });
  if (!faSignatur?.signedURL?.startsWith('/object/sign/')) throw new Error('Belegfreigabe fehlgeschlagen.');
  return faProjekt.datenadresse.replace(/\/$/, '') + '/storage/v1' + faSignatur.signedURL;
}
