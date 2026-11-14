import { faSpeichern } from './zugang.js?v=20261114';

export const faArbeitsstand = { profil: null, personen: [], inhalte: [], neuLaden: () => {} };
export const faPhasen = { neu: 'Neu eingegangen', erreicht: 'Kontakt hergestellt', gespraech: 'Im Austausch', einarbeitung: 'In Einarbeitung', aktiv: 'Zusammenarbeit aktiv', abgesagt: 'Beendet / abgesagt' };
export const faAufgaben = { inhaber: 'Inhaber', verwaltung: 'Verwaltung', recruiting: 'Recruiting', setter: 'Setter', beratung: 'Beratung' };
export const faIstVerwaltung = () => ['inhaber', 'verwaltung'].includes(faArbeitsstand.profil?.aufgabe);
export const faGeldtext = (faCent) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(faCent || 0) / 100);
export const faDatumstext = (faZeitpunkt) => faZeitpunkt ? new Date(faZeitpunkt).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : '—';
export const faPersonentext = (faKennung) => faArbeitsstand.personen.find((faZeile) => faZeile.kennung === faKennung)?.anzeigename || (faKennung ? 'Zugeordnete Person' : 'Nicht zugeordnet');
export const faInhaltstext = (faKennung) => faArbeitsstand.inhalte.find((faZeile) => faZeile.kennung === faKennung)?.anzeigename || (faKennung ? 'Inhaltspartner' : 'Kein Inhaltspartner');
export const faPersonenoptionen = () => faArbeitsstand.personen.filter((faZeile) => ['inhaber', 'verwaltung', 'recruiting'].includes(faZeile.aufgabe)).map((faZeile) => [faZeile.kennung, faZeile.anzeigename]);
export const faInhaltsoptionen = () => faArbeitsstand.inhalte.map((faZeile) => [faZeile.kennung, faZeile.anzeigename]);

export function faElement(faTyp, faAttribute = {}, ...faKinder) {
  const faKnoten = document.createElement(faTyp);
  for (const [faSchluessel, faInhalt] of Object.entries(faAttribute || {})) {
    if (faInhalt === null || faInhalt === undefined || faInhalt === false) continue;
    if (faSchluessel === 'aktionen') {
      Object.entries(faInhalt).forEach(([faEreignis, faReaktion]) => faKnoten.addEventListener(faEreignis, faReaktion));
    } else if (faSchluessel === 'class') faKnoten.className = faInhalt;
    else if (['value', 'checked', 'disabled', 'hidden', 'readOnly'].includes(faSchluessel)) faKnoten[faSchluessel] = faInhalt;
    else faKnoten.setAttribute(faSchluessel, faInhalt === true ? '' : String(faInhalt));
  }
  for (const faKind of faKinder.flat(Infinity)) if (faKind !== null && faKind !== undefined && faKind !== false) faKnoten.append(faKind instanceof Node ? faKind : document.createTextNode(String(faKind)));
  return faKnoten;
}
export function faKnopf(faBeschriftung, faAktion, faStil = 'linie') {
  return faElement('button', { type: 'button', class: 'fa-knopf fa-knopf-klein' + (faStil ? ' fa-knopf-' + faStil : ''), aktionen: { click: faAktion } }, faBeschriftung);
}
export const faMarkierung = (faInhalt, faPhase = '') => faElement('span', { class: 'fa-statusmarke', 'data-fa-phase': faPhase }, faInhalt);
export function faBereichskopf(faTitel, faErklaerung, ...faAktionen) {
  return faElement('div', { class: 'fa-bereichskopf' }, faElement('div', {}, faElement('h1', {}, faTitel), faElement('p', {}, faErklaerung)), faElement('div', { class: 'fa-bereichsknopf' }, faAktionen));
}
export function faLeerzustand(faTitel, faErklaerung = 'Sobald Einträge vorhanden sind, werden sie hier angezeigt.') {
  return faElement('div', { class: 'fa-nichts' }, faElement('h2', {}, faTitel), faElement('p', {}, faErklaerung));
}
let faMeldungsuhr;
export function faKurzMelden(faText) {
  const faHinweis = document.getElementById('fa-kurzmeldung');
  clearTimeout(faMeldungsuhr);
  faHinweis.textContent = faText; faHinweis.hidden = false;
  faMeldungsuhr = setTimeout(() => { faHinweis.hidden = true; }, 6000);
}
export async function faAusfuehren(faSchalter, faAktion, faErfolg = 'Änderung gespeichert.') {
  if (faSchalter) faSchalter.disabled = true;
  try { const faAntwort = await faAktion(); if (faErfolg) faKurzMelden(faErfolg); return faAntwort; }
  catch (faFehler) { faKurzMelden(faFehler.message || 'Der Vorgang ist fehlgeschlagen.'); return null; }
  finally { if (faSchalter) faSchalter.disabled = false; }
}
export function faDialogOeffnen(faTitel, ...faInhalte) {
  const faDialog = document.getElementById('fa-bearbeitungsdialog');
  document.getElementById('fa-dialogtitel').textContent = faTitel;
  document.getElementById('fa-dialoginhalt').replaceChildren(...faInhalte.flat());
  if (!faDialog.open) faDialog.showModal();
  return faDialog;
}
export function faGrundErfragen(faTitel, faErklaerung, faKnopftext = 'Bestätigen') {
  return new Promise((faFertig) => {
    const faEingabe = faElement('textarea', { id: 'fa-vorgangsgrund', required: true, minlength: 3, maxlength: 500, rows: 3 });
    const faForm = faElement('form', { class: 'fa-formular' }, faElement('p', { class: 'fa-hinweis' }, faErklaerung),
      faElement('div', { class: 'fa-feld' }, faElement('label', { for: 'fa-vorgangsgrund' }, 'Begründung oder Referenz'), faEingabe),
      faElement('button', { type: 'submit', class: 'fa-knopf' }, faKnopftext));
    const faDialog = faDialogOeffnen(faTitel, faForm);
    faDialog.addEventListener('close', () => faFertig(null), { once: true });
    faForm.addEventListener('submit', (faAktion) => { faAktion.preventDefault(); if (!faForm.reportValidity()) return; faFertig(faEingabe.value.trim()); faDialog.close(); });
  });
}

// Feldbeschreibung: name, titel, art, pflicht, optionen, min, max, schritt.
export function faBearbeiten(faTitel, faArt, faFelder, faAlt = {}, faSonderablauf = null) {
  const faEingaben = new Map();
  const faForm = faElement('form', { class: 'fa-formular' });
  for (const faFeld of faFelder) {
    const faId = 'fa-bearbeitung-' + faFeld.name;
    const faTyp = faFeld.art || 'text';
    let faWert = faAlt[faFeld.name] ?? faFeld.vorgabe ?? '';
    if (['geld', 'quote'].includes(faTyp) && faWert !== '') faWert = Number(faWert) / 100;
    if (faTyp === 'datetime-local' && faWert) {
      const faDatum = new Date(faWert); faWert = new Date(faDatum.getTime() - faDatum.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    const faAttribute = { id: faId, name: faFeld.name, required: Boolean(faFeld.pflicht), value: faWert };
    let faEingabe;
    if (faTyp === 'select') {
      faEingabe = faElement('select', faAttribute, faElement('option', { value: '' }, faFeld.pflicht ? 'Bitte auswählen' : 'Nicht zugeordnet'), (faFeld.optionen || []).map(([faCode, faName]) => faElement('option', { value: faCode }, faName)));
      faEingabe.value = faWert;
    } else if (faTyp === 'textarea') faEingabe = faElement('textarea', { ...faAttribute, maxlength: 5000, rows: 3 });
    else if (faTyp === 'checkbox') faEingabe = faElement('select', { ...faAttribute }, faElement('option', { value: 'true' }, 'Freigeschaltet'), faElement('option', { value: 'false' }, 'Gesperrt'));
    else {
      faEingabe = faElement('input', { ...faAttribute, type: ['geld', 'quote'].includes(faTyp) ? 'number' : faTyp,
        min: faFeld.min ?? (['geld', 'quote', 'number'].includes(faTyp) ? 0 : null), max: faFeld.max ?? (faTyp === 'quote' ? 100 : null), step: faFeld.schritt ?? (['geld', 'quote'].includes(faTyp) ? '0.01' : faTyp === 'number' ? '1' : null),
        maxlength: ['text', 'email', 'tel'].includes(faTyp) ? 254 : null, accept: faTyp === 'file' ? 'application/pdf,image/png,image/jpeg,image/webp' : null,
      });
    }
    if (faTyp === 'checkbox') faEingabe.value = String(faAlt[faFeld.name] ?? true);
    faEingaben.set(faFeld.name, { faEingabe, faTyp });
    faForm.append(faElement('div', { class: 'fa-feld' }, faElement('label', { for: faId }, faFeld.titel, faFeld.pflicht ? '' : faElement('small', {}, ' (optional)')), faEingabe, faFeld.hilfe ? faElement('p', { class: 'fa-feld-hilfe' }, faFeld.hilfe) : null));
  }
  const faFehleranzeige = faElement('p', { class: 'fa-formularstatus', role: 'alert', hidden: true, tabindex: '-1' });
  const faSpeicherknopf = faElement('button', { type: 'submit', class: 'fa-knopf' }, 'Übernehmen');
  faForm.append(faFehleranzeige, faSpeicherknopf);
  const faDialog = faDialogOeffnen(faTitel, faForm);
  faForm.addEventListener('submit', async (faAktion) => {
    faAktion.preventDefault(); if (!faForm.reportValidity()) return;
    const faNeu = { ...faAlt };
    for (const [faName, { faEingabe, faTyp }] of faEingaben) {
      let faInhalt = faEingabe.value.trim();
      if (faTyp === 'checkbox') faInhalt = faInhalt === 'true';
      if (['geld', 'quote'].includes(faTyp)) faInhalt = faInhalt === '' ? null : Math.round(Number(faInhalt) * 100);
      if (faTyp === 'number') faInhalt = faInhalt === '' ? 0 : Math.round(Number(faInhalt));
      if (faTyp === 'datetime-local') faInhalt = faInhalt ? new Date(faInhalt).toISOString() : null;
      if (faTyp === 'file') faInhalt = faEingabe.files[0] || null;
      faNeu[faName] = faInhalt;
    }
    faSpeicherknopf.disabled = true; faFehleranzeige.hidden = true;
    try {
      if (faSonderablauf) await faSonderablauf(faNeu);
      else await faSpeichern(faArt, faNeu);
      faDialog.close(); faKurzMelden('Änderung übernommen.'); await faArbeitsstand.neuLaden();
    } catch (faFehler) { faFehleranzeige.textContent = faFehler.message; faFehleranzeige.hidden = false; faFehleranzeige.focus(); }
    finally { faSpeicherknopf.disabled = false; }
  });
}

export function faTabelle(faZeilen, faSpalten, faAktionen = null) {
  if (!faZeilen.length) return faLeerzustand('Noch keine passenden Einträge');
  return faElement('div', { class: 'fa-tabellenrahmen' }, faElement('table', { class: 'fa-datentabelle' },
    faElement('thead', {}, faElement('tr', {}, faSpalten.map((faSpalte) => faElement('th', { scope: 'col' }, faSpalte.titel)), faAktionen ? faElement('th', { scope: 'col' }, 'Bearbeitung') : null)),
    faElement('tbody', {}, faZeilen.map((faZeile) => faElement('tr', {}, faSpalten.map((faSpalte) => faElement('td', {}, faSpalte.anzeigen ? faSpalte.anzeigen(faZeile) : faZeile[faSpalte.name] ?? '—')), faAktionen ? faElement('td', {}, faElement('div', { class: 'fa-tabellenaktionen' }, faAktionen(faZeile))) : null)))));
}

export function faCsvHerunterladen(faZeilen, faSpalten, faDateiname) {
  const faZelle = (faWert) => {
    let faText = String(faWert ?? '');
    if (/^[\s]*[=+@-]/.test(faText)) faText = "'" + faText;
    return '"' + faText.replace(/"/g, '""') + '"';
  };
  const faInhalt = '\uFEFF' + [faSpalten.map((faSpalte) => faZelle(faSpalte.titel)).join(';'), ...faZeilen.map((faZeile) => faSpalten.map((faSpalte) => faZelle(faZeile[faSpalte.name])).join(';'))].join('\r\n');
  const faAdresse = URL.createObjectURL(new Blob([faInhalt], { type: 'text/csv;charset=utf-8' }));
  const faVerweis = faElement('a', { href: faAdresse, download: faDateiname });
  document.body.append(faVerweis); faVerweis.click(); faVerweis.remove(); setTimeout(() => URL.revokeObjectURL(faAdresse), 1000);
}

export function faGefilterteTabelle(faZeilen, faSpalten, faAktionen, faStatuswerte = null) {
  const faSuchfeld = faElement('input', { type: 'search', placeholder: 'Einträge durchsuchen', 'aria-label': 'Einträge durchsuchen' });
  const faStatusfeld = faStatuswerte ? faElement('select', { 'aria-label': 'Status filtern' }, faElement('option', { value: '' }, 'Alle Status'), Object.entries(faStatuswerte).map(([faCode, faText]) => faElement('option', { value: faCode }, faText))) : null;
  const faAusgabe = faElement('div');
  let faTreffer = faZeilen;
  const faNeuZeichnen = () => {
    const faSuche = faSuchfeld.value.trim().toLocaleLowerCase('de-DE');
    faTreffer = faZeilen.filter((faZeile) => (!faStatusfeld?.value || faZeile.phase === faStatusfeld.value) && (!faSuche || Object.values(faZeile).some((faWert) => typeof faWert === 'string' && faWert.toLocaleLowerCase('de-DE').includes(faSuche))));
    faAusgabe.replaceChildren(faTabelle(faTreffer, faSpalten, faAktionen), faElement('p', { class: 'fa-datenhinweis' }, faTreffer.length + ' von ' + faZeilen.length + ' Einträgen'));
  };
  faSuchfeld.addEventListener('input', faNeuZeichnen); faStatusfeld?.addEventListener('change', faNeuZeichnen); faNeuZeichnen();
  const faExport = faKnopf('Ansicht als CSV', () => faCsvHerunterladen(faTreffer, faSpalten.filter((faSpalte) => faSpalte.name), 'fa-auswahl.csv'));
  return faElement('div', {}, faElement('div', { class: 'fa-werkzeugzeile' }, faSuchfeld, faStatusfeld, faExport), faAusgabe);
}
