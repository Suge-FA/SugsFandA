import { faZeilen, faSpeichern, faFunktion } from './zugang.js?v=20261114';
import { faArbeitsstand, faElement, faKnopf, faBereichskopf, faIstVerwaltung, faPhasen, faPersonentext, faPersonenoptionen, faInhaltsoptionen, faMarkierung, faDatumstext, faGeldtext, faLeerzustand, faGefilterteTabelle, faTabelle, faBearbeiten, faDialogOeffnen, faGrundErfragen, faAusfuehren, faKurzMelden } from './arbeitsbausteine.js?v=20261114';

function faKontaktfelder() {
  return [
    { name: 'anzeigename', titel: 'Vollständiger Name', pflicht: true },
    { name: 'postfach', titel: 'E-Mail-Adresse', art: 'email' },
    { name: 'telefon', titel: 'Telefonnummer', art: 'tel' },
    { name: 'phase', titel: 'Kontaktstand', art: 'select', pflicht: true, optionen: Object.entries(faPhasen), vorgabe: 'neu' },
    { name: 'herkunft', titel: 'Herkunft des Kontakts', vorgabe: 'manuell' },
    ...(faIstVerwaltung() ? [
      { name: 'betreuung', titel: 'Zuständige Betreuung', art: 'select', optionen: faPersonenoptionen() },
      { name: 'erstgespraech', titel: 'Abweichende Person für das Erstgespräch', art: 'select', optionen: faPersonenoptionen() },
      { name: 'inhaltspartner', titel: 'Zugeordneter Inhaltspartner', art: 'select', optionen: faInhaltsoptionen() },
    ] : []),
    { name: 'rueckruf', titel: 'Nächste Rückmeldung am', art: 'datetime-local' },
    { name: 'erfahrung', titel: 'Bisherige Erfahrung' },
    { name: 'nachricht', titel: 'Zusätzliche Angaben', art: 'textarea' },
  ];
}
export function faKontaktBearbeiten(faKontakt = {}) {
  faBearbeiten(faKontakt.kennung ? 'Kontakt bearbeiten' : 'Neuen Kontakt erfassen', 'kontakte', faKontaktfelder(), faKontakt);
}

async function faNotizenZeigen(faKontakt) {
  const faNotizen = await faZeilen('fa_gespraechsnotizen', { kontakt: 'eq.' + faKontakt.kennung });
  const faVerlauf = faElement('div', { class: 'fa-dialog-notizen' }, faNotizen.length ? faNotizen.map((faNotiz) => faElement('div', { class: 'fa-einzelnotiz' },
    faElement('small', {}, faDatumstext(faNotiz.angelegt) + ' · ' + faPersonentext(faNotiz.verfasser)), faNotiz.inhalt)) : faElement('p', { class: 'fa-hinweis' }, 'Bisher wurden keine Gesprächsnotizen hinterlegt.'));
  const faText = faElement('textarea', { id: 'fa-gespraechsnotiz', required: true, maxlength: 5000, rows: 4 });
  const faKnopfSpeichern = faElement('button', { type: 'submit', class: 'fa-knopf' }, 'Notiz ergänzen');
  const faNotizformular = faElement('form', { class: 'fa-formular' }, faElement('div', { class: 'fa-feld' }, faElement('label', { for: 'fa-gespraechsnotiz' }, 'Gespräch oder nächsten Schritt festhalten'), faText), faKnopfSpeichern);
  const faAngaben = faElement('dl', { class: 'fa-detailraster' },
    faElement('div', {}, faElement('dt', {}, 'Kontakt'), faElement('dd', {}, faKontakt.postfach || faKontakt.telefon || 'Keine Angabe')),
    faElement('div', {}, faElement('dt', {}, 'Stand'), faElement('dd', {}, faPhasen[faKontakt.phase])),
    faElement('div', {}, faElement('dt', {}, 'Betreuung'), faElement('dd', {}, faPersonentext(faKontakt.betreuung))),
    faElement('div', {}, faElement('dt', {}, 'Nächste Rückmeldung'), faElement('dd', {}, faDatumstext(faKontakt.rueckruf))));
  faDialogOeffnen(faKontakt.anzeigename, faAngaben, faVerlauf, faKontakt.anonymisiert ? null : faNotizformular);
  faNotizformular.addEventListener('submit', async (faAktion) => {
    faAktion.preventDefault(); if (!faNotizformular.reportValidity()) return;
    await faAusfuehren(faKnopfSpeichern, async () => {
      await faSpeichern('notizen', { kontakt: faKontakt.kennung, inhalt: faText.value.trim() });
      await faNotizenZeigen(faKontakt);
    }, 'Notiz hinterlegt.');
  });
}

function faKontaktaktionen(faKontakt) {
  return [
    faKnopf('Verlauf', (faAktion) => faAusfuehren(faAktion.currentTarget, () => faNotizenZeigen(faKontakt), '')),
    faKontakt.anonymisiert ? null : faKnopf('Bearbeiten', () => faKontaktBearbeiten(faKontakt)),
    faIstVerwaltung() && !faKontakt.anonymisiert ? faKnopf('Daten entfernen', async (faAktion) => {
      const faSchalter = faAktion.currentTarget;
      const faGrund = await faGrundErfragen('Kontaktdaten unwiderruflich entfernen', 'Name, Kontaktangaben und Gesprächsnotizen werden entfernt. Bestehende Buchungsnachweise bleiben ohne diese Kontaktangaben erhalten.', 'Daten entfernen');
      if (faGrund) await faAusfuehren(faSchalter, async () => { await faFunktion('fa_kontakt_anonymisieren', { p_kennung: faKontakt.kennung, p_grund: faGrund }); await faArbeitsstand.neuLaden(); });
    }, 'gefahr') : null,
  ];
}

const faKontaktspalten = [
  { name: 'anzeigename', titel: 'Kontakt' },
  { name: 'phase', titel: 'Stand', anzeigen: (faKontakt) => faMarkierung(faPhasen[faKontakt.phase], faKontakt.phase) },
  { name: 'telefon', titel: 'Erreichbarkeit', anzeigen: (faKontakt) => faElement('div', {}, faKontakt.telefon ? faElement('a', { href: 'tel:' + faKontakt.telefon.replace(/[^+\d]/g, '') }, faKontakt.telefon) : '', faElement('div', {}, faKontakt.postfach)) },
  { name: 'betreuung', titel: 'Betreuung', anzeigen: (faKontakt) => faPersonentext(faKontakt.betreuung) },
  { name: 'rueckruf', titel: 'Rückmeldung', anzeigen: (faKontakt) => faDatumstext(faKontakt.rueckruf) },
];

export async function faKontakteAnzeigen() {
  const faKontakte = await faZeilen('fa_kontakte');
  return faElement('section', {}, faBereichskopf(faIstVerwaltung() ? 'Kontaktübersicht' : 'Meine Kontakte', 'Zuständigkeit, Gesprächsstand und nächste Schritte an einem Ort.', faKnopf('Kontakt hinzufügen', () => faKontaktBearbeiten(), '')),
    faGefilterteTabelle(faKontakte, faKontaktspalten, faKontaktaktionen, faPhasen));
}

export async function faUeberblickAnzeigen() {
  const faAnfragen = [faZeilen('fa_kontakte'), faZeilen('fa_provisionszeilen')];
  if (faIstVerwaltung()) faAnfragen.push(faZeilen('fa_partneranfragen'));
  const [faKontakte, faProvisionen, faPartner = []] = await Promise.all(faAnfragen);
  const faOffen = faKontakte.filter((faKontakt) => !['aktiv', 'abgesagt'].includes(faKontakt.phase));
  const faFaellig = faOffen.filter((faKontakt) => faKontakt.rueckruf && new Date(faKontakt.rueckruf) <= new Date()).sort((faLinks, faRechts) => faLinks.rueckruf.localeCompare(faRechts.rueckruf));
  const faKennzahl = (faTitel, faWert, faZusatz, faAkzent = false) => faElement('div', { class: 'fa-kennzahl' + (faAkzent ? ' fa-kennzahl-akzent' : '') }, faElement('span', {}, faTitel), faElement('strong', {}, faWert), faElement('small', {}, faZusatz));
  const faOffenerBetrag = faProvisionen.filter((faZeile) => !faZeile.auszahlung).reduce((faSumme, faZeile) => faSumme + Number(faZeile.betrag_cent), 0);
  return faElement('section', {}, faBereichskopf('Guten Tag, ' + faArbeitsstand.profil.anzeigename.split(' ')[0] + '.', 'Hier siehst du, was Aufmerksamkeit braucht und was bereits weitergekommen ist.', faKnopf('Neuer Kontakt', () => faKontaktBearbeiten(), '')),
    faElement('div', { class: 'fa-kennzahlen' },
      faKennzahl('Offene Kontakte', faOffen.length, 'Noch im laufenden Austausch', true),
      faKennzahl('Rückmeldung fällig', faFaellig.length, 'Für heute oder früher vorgemerkt'),
      faKennzahl('Offene Provisionen', faGeldtext(faOffenerBetrag), 'Nach bestätigten Buchungen'),
      faKennzahl(faIstVerwaltung() ? 'Neue Partneranfragen' : 'Aktive Zusammenarbeit', faIstVerwaltung() ? faPartner.filter((faZeile) => !faZeile.bearbeitet).length : faKontakte.filter((faKontakt) => faKontakt.phase === 'aktiv').length, faIstVerwaltung() ? 'Noch nicht als bearbeitet markiert' : 'In deinen betreuten Kontakten')),
    faElement('div', { class: 'fa-datenkarte' }, faElement('h2', {}, 'Die nächsten Rückmeldungen'), faFaellig.length ? faTabelle(faFaellig.slice(0, 10), faKontaktspalten, faKontaktaktionen) : faLeerzustand('Gerade keine Rückmeldung fällig', 'Termine für deine nächsten Schritte kannst du direkt am Kontakt hinterlegen.')));
}

export async function faPartnerAnzeigen() {
  const faPartner = await faZeilen('fa_partneranfragen');
  return faElement('section', {}, faBereichskopf('Anfragen zur Partnerschaft', 'Eingänge aus dem öffentlichen Kontaktformular bearbeiten und die Rückmeldung dokumentieren.'),
    faGefilterteTabelle(faPartner, [
      { name: 'anzeigename', titel: 'Ansprechperson' }, { name: 'unternehmen', titel: 'Unternehmen' },
      { name: 'postfach', titel: 'Kontakt', anzeigen: (faZeile) => faElement('a', { href: 'mailto:' + faZeile.postfach }, faZeile.postfach) },
      { name: 'angelegt', titel: 'Eingegangen', anzeigen: (faZeile) => faDatumstext(faZeile.angelegt) },
      { name: 'bearbeitet', titel: 'Bearbeitungsstand', anzeigen: (faZeile) => faMarkierung(faZeile.bearbeitet ? 'Rückmeldung erfolgt' : 'Neu', faZeile.bearbeitet ? 'aktiv' : 'neu') },
    ], (faZeile) => [faKnopf('Ansehen', () => {
      faDialogOeffnen('Anfrage von ' + faZeile.anzeigename,
        faElement('p', { class: 'fa-textblock' }, faZeile.nachricht || 'Keine zusätzliche Nachricht.'),
        faElement('p', { class: 'fa-hinweis' }, faZeile.telefon),
        faKnopf('Bearbeitungsnotiz', () => faBearbeiten('Rückmeldung dokumentieren', 'partneranfragen', [
          { name: 'bearbeitet', titel: 'Rückmeldung erfolgt', art: 'select', pflicht: true, optionen: [['false', 'Noch offen'], ['true', 'Erledigt']] },
          { name: 'bemerkung', titel: 'Interne Notiz', art: 'textarea' },
        ], { ...faZeile, bearbeitet: String(faZeile.bearbeitet) })));
    })]));
}
