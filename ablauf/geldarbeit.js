import { faZeilen, faFunktion, faZahlungMitBelegSpeichern, faBelegadresse, faPasswortErsetzen } from './zugang.js';
import { faArbeitsstand, faElement, faKnopf, faBereichskopf, faIstVerwaltung, faGeldtext, faDatumstext, faPersonentext, faInhaltstext, faMarkierung, faGefilterteTabelle, faTabelle, faBearbeiten, faGrundErfragen, faAusfuehren, faDialogOeffnen, faKurzMelden } from './arbeitsbausteine.js';

export async function faZahlungenAnzeigen() {
  const [faZahlungen, faKontakte, faParameter] = await Promise.all([faZeilen('fa_zahlungseingaenge'), faZeilen('fa_kontakte'), faZeilen('fa_parameter', { order: 'kennung.asc' })]);
  const faNamen = new Map(faKontakte.map((faKontakt) => [faKontakt.kennung, faKontakt.anzeigename]));
  const faZugang = faParameter.find((faZeile) => faZeile.kennung === 'zugang_cent')?.wert || 0;
  return faElement('section', {}, faBereichskopf('Zahlungseingänge', 'Zahlungen erfassen und erst nach tatsächlichem Eingang bestätigen. Die Bestätigung erzeugt die vereinbarten Provisionszeilen.', faKnopf('Eingang erfassen', () => faBearbeiten('Zahlungseingang erfassen', 'zahlungseingaenge', [
    { name: 'kontakt', titel: 'Zugehöriger Kontakt', art: 'select', pflicht: true, optionen: faKontakte.filter((faKontakt) => !faKontakt.anonymisiert).map((faKontakt) => [faKontakt.kennung, faKontakt.anzeigename]) },
    { name: 'betrag_cent', titel: 'Betrag in Euro', art: 'geld', pflicht: true, min: '0.01', vorgabe: faZugang },
    { name: 'bezeichnung', titel: 'Referenz / Zuordnung', pflicht: true },
    { name: 'fa_belegdatei', titel: 'Beleg (PDF oder Bild, bis 5 MB)', art: 'file' },
  ], {}, faZahlungMitBelegSpeichern), '')),
    faGefilterteTabelle(faZahlungen, [
      { name: 'kontakt', titel: 'Kontakt', anzeigen: (faZeile) => faNamen.get(faZeile.kontakt) || 'Kontakt' },
      { name: 'betrag_cent', titel: 'Betrag', anzeigen: (faZeile) => faGeldtext(faZeile.betrag_cent) },
      { name: 'zustand', titel: 'Stand', anzeigen: (faZeile) => faMarkierung({ offen: 'Ungeprüft', bestaetigt: 'Bestätigt', storniert: 'Storniert' }[faZeile.zustand], faZeile.zustand) },
      { name: 'bezeichnung', titel: 'Referenz' },
      { name: 'angelegt', titel: 'Erfasst', anzeigen: (faZeile) => faDatumstext(faZeile.angelegt) },
    ], (faZeile) => [
      faZeile.zustand === 'offen' ? faKnopf('Eingang bestätigen', async (faAktion) => {
        const faSchalter = faAktion.currentTarget;
        const faGrund = await faGrundErfragen('Tatsächlichen Zahlungseingang bestätigen', 'Für ' + faGeldtext(faZeile.betrag_cent) + ' werden die aktuell eingestellten Provisionen gebucht. Bitte prüfe den Geldeingang und die Konditionen vorher.', 'Eingang bestätigen');
        if (faGrund) await faAusfuehren(faSchalter, async () => { await faFunktion('fa_zahlung_bearbeiten', { p_kennung: faZeile.kennung, p_vorgang: 'bestaetigen' }); await faArbeitsstand.neuLaden(); }, 'Zahlung bestätigt und Provisionen gebucht.');
      }) : null,
      faZeile.zustand !== 'storniert' ? faKnopf('Storno', async (faAktion) => {
        const faSchalter = faAktion.currentTarget;
        const faGrund = await faGrundErfragen('Zahlung stornieren', 'Bereits entstandene Provisionen werden durch Gegenbuchungen ausgeglichen. Eine tatsächliche Rückzahlung veranlasst du selbst.', 'Storno dokumentieren');
        if (faGrund) await faAusfuehren(faSchalter, async () => { await faFunktion('fa_zahlung_bearbeiten', { p_kennung: faZeile.kennung, p_vorgang: 'stornieren' }); await faArbeitsstand.neuLaden(); }, 'Storno mit Gegenbuchungen dokumentiert.');
      }, 'gefahr') : null,
      faZeile.belegpfad ? faKnopf('Beleg', (faAktion) => faAusfuehren(faAktion.currentTarget, async () => {
        const faAdresse = await faBelegadresse(faZeile.belegpfad);
        faDialogOeffnen('Beleg ansehen', faElement('p', { class: 'fa-hinweis' }, 'Der folgende Zugriff ist eine Minute gültig.'), faElement('a', { class: 'fa-knopf', href: faAdresse, target: '_blank', rel: 'noopener noreferrer' }, 'Beleg öffnen'));
      }, '')) : null,
    ]));
}

export async function faProvisionenAnzeigen() {
  const faProvisionen = await faZeilen('fa_provisionszeilen');
  const faName = (faZeile) => faZeile.empfaengerart === 'inhalt' ? faInhaltstext(faZeile.empfaenger) : faPersonentext(faZeile.empfaenger);
  return faElement('section', {}, faBereichskopf(faIstVerwaltung() ? 'Provisionsbuchungen' : 'Meine Provisionsbuchungen', 'Entstandene Ansprüche, Gegenbuchungen und die Zuordnung zu dokumentierten Auszahlungen.'),
    faGefilterteTabelle(faProvisionen, [
      { name: 'empfaenger', titel: 'Empfänger', anzeigen: faName }, { name: 'bezeichnung', titel: 'Buchungsart' },
      { name: 'betrag_cent', titel: 'Betrag', anzeigen: (faZeile) => faGeldtext(faZeile.betrag_cent) },
      { name: 'auszahlung', titel: 'Abrechnung', anzeigen: (faZeile) => faMarkierung(faZeile.auszahlung ? 'Dokumentiert' : 'Noch offen', faZeile.auszahlung ? 'aktiv' : 'offen') },
      { name: 'angelegt', titel: 'Gebucht', anzeigen: (faZeile) => faDatumstext(faZeile.angelegt) },
    ]));
}

export async function faAuszahlungenAnzeigen() {
  const [faProvisionen, faAuszahlungen] = await Promise.all([faZeilen('fa_provisionszeilen'), faZeilen('fa_auszahlungen')]);
  const faOffen = new Map();
  faProvisionen.filter((faZeile) => !faZeile.auszahlung).forEach((faZeile) => {
    if (!faOffen.has(faZeile.empfaenger)) faOffen.set(faZeile.empfaenger, { empfaenger: faZeile.empfaenger, empfaengerart: faZeile.empfaengerart, betrag_cent: 0, zeilen: 0 });
    const faGruppe = faOffen.get(faZeile.empfaenger); faGruppe.betrag_cent += Number(faZeile.betrag_cent); faGruppe.zeilen++;
  });
  const faEmpfangsname = (faZeile) => faZeile.empfaengerart === 'inhalt' ? faInhaltstext(faZeile.empfaenger) : faPersonentext(faZeile.empfaenger);
  return faElement('section', {}, faBereichskopf('Auszahlungen und Verrechnungen', 'Überweisungen führst du selbst aus. Hier dokumentierst du anschließend die Erledigung der zugehörigen Provisionszeilen.'),
    faElement('div', { class: 'fa-datenkarte' }, faElement('h2', {}, 'Offene Salden'), faTabelle([...faOffen.values()], [
      { name: 'empfaenger', titel: 'Empfänger', anzeigen: faEmpfangsname }, { name: 'zeilen', titel: 'Buchungszeilen' },
      { name: 'betrag_cent', titel: 'Saldo', anzeigen: (faZeile) => faGeldtext(faZeile.betrag_cent) },
    ], faIstVerwaltung() ? (faZeile) => [faKnopf(faZeile.betrag_cent > 0 ? 'Auszahlung festhalten' : 'Verrechnung festhalten', async (faAktion) => {
      const faSchalter = faAktion.currentTarget;
      const faGrund = await faGrundErfragen('Abrechnung dokumentieren', 'Aktueller Saldo: ' + faGeldtext(faZeile.betrag_cent) + '. Bitte Zahlungsreferenz oder vereinbarte Verrechnung angeben.', 'Abrechnung festhalten');
      if (faGrund) await faAusfuehren(faSchalter, async () => { await faFunktion('fa_auszahlung_festhalten', { p_person: faZeile.empfaenger, p_erwartet: faZeile.betrag_cent, p_bemerkung: faGrund }); await faArbeitsstand.neuLaden(); });
    })] : null)),
    faElement('div', { class: 'fa-datenkarte' }, faElement('h2', {}, 'Bisher dokumentiert'), faTabelle(faAuszahlungen, [
      { name: 'empfaenger', titel: 'Empfänger', anzeigen: (faZeile) => faArbeitsstand.inhalte.some((faInhalt) => faInhalt.kennung === faZeile.empfaenger) ? faInhaltstext(faZeile.empfaenger) : faPersonentext(faZeile.empfaenger) },
      { name: 'betrag_cent', titel: 'Betrag', anzeigen: (faZeile) => faGeldtext(faZeile.betrag_cent) }, { name: 'bemerkung', titel: 'Referenz / Verrechnung' },
      { name: 'angelegt', titel: 'Zeitpunkt', anzeigen: (faZeile) => faDatumstext(faZeile.angelegt) },
      { name: 'zurueckgenommen', titel: 'Stand', anzeigen: (faZeile) => faMarkierung(faZeile.zurueckgenommen ? 'Aufgehoben' : 'Dokumentiert') },
    ], faIstVerwaltung() ? (faZeile) => [faZeile.zurueckgenommen ? null : faKnopf('Aufheben', async (faAktion) => {
      const faSchalter = faAktion.currentTarget;
      const faGrund = await faGrundErfragen('Dokumentation aufheben', 'Die zugehörigen Provisionszeilen werden wieder als offen geführt. Bitte den Grund angeben.', 'Aufheben');
      if (faGrund) await faAusfuehren(faSchalter, async () => { await faFunktion('fa_auszahlung_aufheben', { p_kennung: faZeile.kennung, p_grund: faGrund }); await faArbeitsstand.neuLaden(); });
    })] : null)));
}

export async function faBerichtAnzeigen() {
  const [faKontakte, faZahlungen, faKampagnen] = await Promise.all([faZeilen('fa_kontakte'), faZeilen('fa_zahlungseingaenge'), faZeilen('fa_kampagnen')]);
  const faBeginn = new Date(Date.now() - 7 * 86400000);
  const faNeu = faKontakte.filter((faZeile) => new Date(faZeile.angelegt) >= faBeginn).length;
  const faBestaetigt = faZahlungen.filter((faZeile) => faZeile.zustand === 'bestaetigt' && new Date(faZeile.bestaetigt) >= faBeginn);
  const faAusgaben = faKampagnen.reduce((faSumme, faZeile) => faSumme + Number(faZeile.ausgaben_cent), 0);
  const faKennzahl = (faTitel, faWert, faZusatz) => faElement('div', { class: 'fa-kennzahl' }, faElement('span', {}, faTitel), faElement('strong', {}, faWert), faElement('small', {}, faZusatz));
  return faElement('section', {}, faBereichskopf('Zahlen für den Überblick', 'Auswertung der eigenen Daten. Keine automatischen Abrufe aus Werbeplattformen und keine KI-Auswertung.'),
    faElement('div', { class: 'fa-kennzahlen' },
      faKennzahl('Neue Kontakte', faNeu, 'In den letzten sieben Tagen'),
      faKennzahl('Bestätigte Eingänge', faBestaetigt.length, 'Bestätigungen in den letzten sieben Tagen'),
      faKennzahl('Bestätigter Betrag', faGeldtext(faBestaetigt.reduce((faSumme, faZeile) => faSumme + Number(faZeile.betrag_cent), 0)), 'Aktuell nicht stornierte Eingänge'),
      faKennzahl('Erfasste Kampagnenkosten', faGeldtext(faAusgaben), 'Gesamtstand der manuellen Erfassung')),
    faElement('div', { class: 'fa-datenkarte' }, faElement('h2', {}, 'Kontakte nach Stand'), faTabelle(Object.entries({ neu: 'Neu', erreicht: 'Erreicht', gespraech: 'Im Austausch', einarbeitung: 'Einarbeitung', aktiv: 'Aktiv', abgesagt: 'Beendet' }).map(([faCode, faName]) => ({ bezeichnung: faName, anzahl: faKontakte.filter((faZeile) => faZeile.phase === faCode).length })), [{ name: 'bezeichnung', titel: 'Stand' }, { name: 'anzahl', titel: 'Anzahl insgesamt' }])));
}

export async function faEinstellungenAnzeigen() {
  const faParameter = faIstVerwaltung() ? await faZeilen('fa_parameter', { order: 'kennung.asc' }) : [];
  const faTexte = { zugang_cent: 'Vereinbarter Systemzugang', recruiting_cent: 'Recruiting-Provision je Einzahlung', inhalt_bp: 'Standardanteil Inhaltspartner', erstgespraech_bp: 'Anteil für ein abweichendes Erstgespräch' };
  const faKarten = faParameter.map((faZeile) => faElement('div', { class: 'fa-datenkarte' }, faElement('h2', {}, faTexte[faZeile.kennung]),
    faElement('p', { class: 'fa-hinweis' }, faZeile.beschreibung),
    faElement('p', {}, faZeile.kennung.endsWith('_bp') ? (faZeile.wert / 100).toLocaleString('de-DE') + ' %' : faGeldtext(faZeile.wert)),
    faKnopf('Wert ändern', () => faBearbeiten('Kondition anpassen', 'parameter', [
      { name: 'wert', titel: faZeile.kennung.endsWith('_bp') ? 'Wert in Prozent' : 'Wert in Euro', art: faZeile.kennung.endsWith('_bp') ? 'quote' : 'geld', pflicht: true },
    ], { parameter: faZeile.kennung, wert: faZeile.wert }))));
  return faElement('section', {}, faBereichskopf('Einstellungen', 'Konditionen gelten für neue Bestätigungen. Bereits gebuchte Beträge werden durch eine Änderung nicht rückwirkend verändert.'),
    faIstVerwaltung() ? faElement('p', { class: 'fa-formularstatus' }, 'Die Startwerte sind aus dem bisherigen Funktionsumfang übernommene Rechenparameter. Gleiche sie vor der ersten Zahlungsbestätigung mit den tatsächlich geltenden Vereinbarungen ab.') : null,
    faElement('div', { class: 'fa-einstellungsraster' }, faKarten),
    faElement('div', { class: 'fa-datenkarte' }, faElement('h2', {}, 'Persönliches Passwort'), faKnopf('Passwort ändern', () => {
      faBearbeiten('Eigenes Passwort erneuern', '', [{ name: 'fa_neues_passwort', titel: 'Neues Passwort (mindestens 12 Zeichen)', art: 'password', pflicht: true }, { name: 'fa_wiederholung', titel: 'Passwort wiederholen', art: 'password', pflicht: true }], {}, async (faWerte) => {
        if (faWerte.fa_neues_passwort.length < 12 || faWerte.fa_neues_passwort !== faWerte.fa_wiederholung) throw new Error('Bitte mindestens zwölf Zeichen wählen und beide Eingaben gleich ausfüllen.');
        await faPasswortErsetzen(faWerte.fa_neues_passwort);
      });
    })));
}

export async function faEreignisseAnzeigen() {
  const faEreignisse = await faZeilen('fa_ereignisse');
  return faElement('section', {}, faBereichskopf('Änderungsprotokoll', 'Zeitpunkt, handelnde Person und Art der Änderung. Kontakttexte und Passwörter werden hier nicht mitgeschrieben.'),
    faGefilterteTabelle(faEreignisse, [
      { name: 'angelegt', titel: 'Zeitpunkt', anzeigen: (faZeile) => faDatumstext(faZeile.angelegt) },
      { name: 'handelnder', titel: 'Verantwortlich', anzeigen: (faZeile) => faPersonentext(faZeile.handelnder) },
      { name: 'vorgang', titel: 'Vorgang' }, { name: 'objekt', titel: 'Objektkennung' },
    ]));
}
