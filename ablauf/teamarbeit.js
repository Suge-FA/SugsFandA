import { faProjekt } from './projektwerte.js?v=20261114';
import { faZeilen, faEinladen } from './zugang.js?v=20261114';
import { faArbeitsstand, faElement, faKnopf, faBereichskopf, faAufgaben, faMarkierung, faDatumstext, faGeldtext, faPersonentext, faPersonenoptionen, faInhaltsoptionen, faInhaltstext, faGefilterteTabelle, faBearbeiten, faAusfuehren, faKurzMelden, faDialogOeffnen } from './arbeitsbausteine.js?v=20261114';

function faTeamBearbeiten(faAlt = {}) {
  const faRollen = Object.entries(faAufgaben).filter(([faCode]) => faCode !== 'inhaber' || faAlt.aufgabe === 'inhaber').filter(([faCode]) => faArbeitsstand.profil.aufgabe === 'inhaber' || !['inhaber', 'verwaltung'].includes(faCode));
  faBearbeiten(faAlt.kennung ? 'Person bearbeiten' : 'Person ins Team aufnehmen', 'personen', [
    { name: 'anzeigename', titel: 'Name', pflicht: true }, { name: 'postfach', titel: 'E-Mail-Adresse', art: 'email', pflicht: true },
    { name: 'telefon', titel: 'Telefonnummer', art: 'tel' },
    { name: 'aufgabe', titel: 'Zuständigkeit', art: 'select', pflicht: true, optionen: faRollen, vorgabe: 'recruiting' },
    { name: 'freigeschaltet', titel: 'Zugang / Aktivität', art: 'checkbox' }, { name: 'bemerkung', titel: 'Interne Hinweise', art: 'textarea' },
  ], faAlt);
}
export async function faTeamAnzeigen() {
  const faPersonen = await faZeilen('fa_personen');
  return faElement('section', {}, faBereichskopf('Menschen im Team', 'Zuständigkeiten pflegen und persönliche Zugänge freigeben. Verwaltungszugänge legt ausschließlich die Inhaberrolle an.', faKnopf('Person hinzufügen', () => faTeamBearbeiten(), '')),
    faGefilterteTabelle(faPersonen, [
      { name: 'anzeigename', titel: 'Person' }, { name: 'postfach', titel: 'E-Mail' },
      { name: 'aufgabe', titel: 'Zuständigkeit', anzeigen: (faZeile) => faAufgaben[faZeile.aufgabe] },
      { name: 'freigeschaltet', titel: 'Zugang', anzeigen: (faZeile) => faMarkierung(faZeile.freigeschaltet ? 'Freigegeben' : 'Gesperrt', faZeile.freigeschaltet ? 'aktiv' : 'abgesagt') },
    ], (faZeile) => [
      faArbeitsstand.profil.aufgabe === 'inhaber' || !['inhaber', 'verwaltung'].includes(faZeile.aufgabe) ? faKnopf('Bearbeiten', () => faTeamBearbeiten(faZeile)) : null,
      faZeile.freigeschaltet && ['inhaber', 'verwaltung', 'recruiting'].includes(faZeile.aufgabe) && (faArbeitsstand.profil.aufgabe === 'inhaber' || faZeile.aufgabe === 'recruiting') ? faKnopf('Einladung senden', (faAktion) => faAusfuehren(faAktion.currentTarget, () => faEinladen(faZeile.kennung), 'Einladung über dein eigenes Projekt angefordert.')) : null,
    ]));
}

function faInhaltBearbeiten(faAlt = {}) {
  faBearbeiten(faAlt.kennung ? 'Inhaltspartner bearbeiten' : 'Inhaltspartner aufnehmen', 'inhaltspartner', [
    { name: 'anzeigename', titel: 'Name / Bezeichnung', pflicht: true }, { name: 'postfach', titel: 'E-Mail-Adresse', art: 'email' },
    { name: 'anteil_bp', titel: 'Individueller Provisionssatz in %', art: 'quote', hilfe: 'Leer lassen, um den bei einer Buchung geltenden Standardsatz zu verwenden.' },
    { name: 'freigeschaltet', titel: 'Aktivität', art: 'checkbox' }, { name: 'bemerkung', titel: 'Vereinbarungen / Hinweise', art: 'textarea' },
  ], faAlt);
}
export async function faInhalteAnzeigen() {
  const faInhalte = await faZeilen('fa_inhaltspartner');
  return faElement('section', {}, faBereichskopf('Inhaltspartner', 'Ansprechpersonen für Werbeinhalte und deren vereinbarte Provisionssätze.', faKnopf('Inhaltspartner hinzufügen', () => faInhaltBearbeiten(), '')),
    faGefilterteTabelle(faInhalte, [
      { name: 'anzeigename', titel: 'Person / Bezeichnung' }, { name: 'postfach', titel: 'E-Mail' },
      { name: 'anteil_bp', titel: 'Individueller Satz', anzeigen: (faZeile) => faZeile.anteil_bp === null ? 'Standardsatz' : (faZeile.anteil_bp / 100).toLocaleString('de-DE') + ' %' },
      { name: 'freigeschaltet', titel: 'Aktivität', anzeigen: (faZeile) => faMarkierung(faZeile.freigeschaltet ? 'Aktiv' : 'Pausiert') },
    ], (faZeile) => [faKnopf('Bearbeiten', () => faInhaltBearbeiten(faZeile))]));
}

function faKampagneBearbeiten(faAlt = {}) {
  faBearbeiten(faAlt.kennung ? 'Kampagne bearbeiten' : 'Kampagne anlegen', 'kampagnen', [
    { name: 'bezeichnung', titel: 'Kampagnenbezeichnung', pflicht: true },
    { name: 'phase', titel: 'Stand', art: 'select', pflicht: true, optionen: [['geplant', 'Geplant'], ['aktiv', 'Aktiv'], ['pausiert', 'Pausiert'], ['beendet', 'Beendet']], vorgabe: 'geplant' },
    { name: 'betreuung', titel: 'Betreuende Person', art: 'select', optionen: faPersonenoptionen() },
    { name: 'inhaltspartner', titel: 'Inhaltspartner', art: 'select', optionen: faInhaltsoptionen() },
    { name: 'ausgaben_cent', titel: 'Erfasste Ausgaben in Euro', art: 'geld', vorgabe: 0 },
    { name: 'einblendungen', titel: 'Erfasste Einblendungen', art: 'number', vorgabe: 0 },
    { name: 'klicks', titel: 'Erfasste Klicks', art: 'number', vorgabe: 0 },
    { name: 'bemerkung', titel: 'Notizen / Datengrundlage', art: 'textarea' },
  ], faAlt);
}
export async function faKampagnenAnzeigen() {
  const faKampagnen = await faZeilen('fa_kampagnen');
  return faElement('section', {}, faBereichskopf('Kampagnenplanung', 'Kennzahlen werden hier manuell erfasst. Eine automatische Verbindung zu einer Werbeplattform wird nicht aufgebaut.', faKnopf('Kampagne hinzufügen', () => faKampagneBearbeiten(), '')),
    faGefilterteTabelle(faKampagnen, [
      { name: 'bezeichnung', titel: 'Kampagne' }, { name: 'phase', titel: 'Stand', anzeigen: (faZeile) => faMarkierung(faZeile.phase, faZeile.phase) },
      { name: 'betreuung', titel: 'Betreuung', anzeigen: (faZeile) => faPersonentext(faZeile.betreuung) },
      { name: 'inhaltspartner', titel: 'Inhaltspartner', anzeigen: (faZeile) => faInhaltstext(faZeile.inhaltspartner) },
      { name: 'ausgaben_cent', titel: 'Ausgaben', anzeigen: (faZeile) => faGeldtext(faZeile.ausgaben_cent) },
    ], (faZeile) => [faKnopf('Bearbeiten', () => faKampagneBearbeiten(faZeile)), faKnopf('Formularlink', () => faLinkZeigen(faProjekt.webadresse + '/setter/?kampagne=' + faZeile.kennung))]));
}

function faBeitragBearbeiten(faAlt = {}) {
  faBearbeiten(faAlt.kennung ? 'Beitrag bearbeiten' : 'Beitrag planen', 'veroeffentlichungen', [
    { name: 'kanal', titel: 'Kanal / Gruppe / Anlass', pflicht: true },
    { name: 'betreuung', titel: 'Verantwortlich', art: 'select', optionen: faPersonenoptionen() },
    { name: 'phase', titel: 'Bearbeitungsstand', art: 'select', pflicht: true, optionen: [['entwurf', 'Entwurf'], ['veroeffentlicht', 'Veröffentlicht'], ['archiviert', 'Archiviert']], vorgabe: 'entwurf' },
    { name: 'inhalt', titel: 'Beitragstext', art: 'textarea' }, { name: 'bemerkung', titel: 'Interne Notizen', art: 'textarea' },
  ], faAlt);
}
export async function faBeitraegeAnzeigen() {
  const faBeitraege = await faZeilen('fa_veroeffentlichungen');
  return faElement('section', {}, faBereichskopf('Beiträge und Gesprächsanlässe', 'Texte planen und Rückmeldungen festhalten. Veröffentlichen erfolgt eigenständig; es besteht keine Verbindung zu sozialen Netzwerken.', faKnopf('Beitrag hinzufügen', () => faBeitragBearbeiten(), '')),
    faGefilterteTabelle(faBeitraege, [
      { name: 'kanal', titel: 'Kanal / Anlass' }, { name: 'phase', titel: 'Stand', anzeigen: (faZeile) => faMarkierung(faZeile.phase) },
      { name: 'betreuung', titel: 'Verantwortlich', anzeigen: (faZeile) => faPersonentext(faZeile.betreuung) },
      { name: 'angelegt', titel: 'Erfasst', anzeigen: (faZeile) => faDatumstext(faZeile.angelegt) },
    ], (faZeile) => [faKnopf('Bearbeiten', () => faBeitragBearbeiten(faZeile)), faKnopf('Antwortbaustein', () => {
      const faBaustein = faElement('textarea', { class: 'fa-linkfeld', rows: 7, 'aria-label': 'Bearbeitbarer Antwortentwurf', value: 'Danke für dein Interesse. Bei F&A geht es um die selbstständige Ansprache von Geschäftskunden und die Vereinbarung von Beratungsterminen. Wenn du die Tätigkeit kennenlernen möchtest, findest du hier die Möglichkeit zum persönlichen Austausch: ' + faProjekt.webadresse + '/setter/?betreuung=' + faArbeitsstand.profil.vermittlungscode });
      faDialogOeffnen('Antwort selbst formulieren', faElement('p', { class: 'fa-hinweis' }, 'Ein fester Textbaustein zur eigenen Bearbeitung. Es wird kein KI-Dienst aufgerufen und nichts automatisch veröffentlicht.'), faBaustein);
    })]));
}

export function faLinkZeigen(faAdresse) {
  const faEingabe = faElement('input', { class: 'fa-linkfeld', value: faAdresse, readOnly: true, 'aria-label': 'Persönlicher Formularlink' });
  faDialogOeffnen('Link für das Kennenlernen', faElement('p', { class: 'fa-hinweis' }, 'Diesen Link kannst du selbst weitergeben. Die Kennung ordnet den Formulareingang im eigenen Projekt zu.'), faEingabe,
    faKnopf('Link kopieren', async () => {
      try { await navigator.clipboard.writeText(faAdresse); faKurzMelden('Link kopiert.'); }
      catch { faEingabe.select(); faKurzMelden('Bitte den markierten Link manuell kopieren.'); }
    }));
}
export async function faLinksAnzeigen() {
  const faLink = faProjekt.webadresse + '/setter/?betreuung=' + faArbeitsstand.profil.vermittlungscode;
  return faElement('section', {}, faBereichskopf('Mein persönlicher Einstieg', 'Über diese Adresse eingehende Kennenlernanfragen werden deinem Profil zugeordnet.'),
    faElement('div', { class: 'fa-datenkarte' }, faElement('h2', {}, 'Dein Formularlink'), faElement('input', { class: 'fa-linkfeld', readOnly: true, value: faLink, 'aria-label': 'Dein Formularlink' }),
      faElement('div', { class: 'fa-aktionen' }, faKnopf('Link anzeigen und kopieren', () => faLinkZeigen(faLink))),
      faElement('p', { class: 'fa-hinweis' }, 'Bitte gib den Link gezielt weiter. Die Anzeige der Kennung allein erteilt keinen Zugriff auf die Teamzentrale.')));
}
