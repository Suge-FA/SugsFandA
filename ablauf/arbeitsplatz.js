import { faVerbindungBereit } from './projektwerte.js?v=20261114';
import { faAnmelden, faAbmelden, faHatSitzung, faPasswortAnfordern, faPasswortErsetzen, faRueckkehrLesen, faFunktion, faZeilen } from './zugang.js?v=20261114';
import { faArbeitsstand, faElement, faKnopf, faIstVerwaltung, faAufgaben, faLeerzustand, faKurzMelden } from './arbeitsbausteine.js?v=20261114';
import { faUeberblickAnzeigen, faKontakteAnzeigen, faPartnerAnzeigen } from './kontaktarbeit.js?v=20261114';
import { faTeamAnzeigen, faInhalteAnzeigen, faKampagnenAnzeigen, faBeitraegeAnzeigen, faLinksAnzeigen } from './teamarbeit.js?v=20261114';
import { faZahlungenAnzeigen, faProvisionenAnzeigen, faAuszahlungenAnzeigen, faBerichtAnzeigen, faEinstellungenAnzeigen, faEreignisseAnzeigen } from './geldarbeit.js?v=20261114';

const faZugangskarte = document.getElementById('fa-zugangsbereich');
const faArbeitsbereich = document.getElementById('fa-arbeitsbereich');
const faAnmeldeformular = document.getElementById('fa-zugangseingabe');
const faPasswortformular = document.getElementById('fa-passwortsetzen');
const faZugangsmeldung = document.getElementById('fa-zugangsmeldung');
const faArbeitsinhalt = document.getElementById('fa-arbeitsinhalt');
const faDialog = document.getElementById('fa-bearbeitungsdialog');

const faAnsichten = [
  { kennung: 'fa-ueberblick', titel: 'Mein Überblick', zeichen: '◫', zeigen: faUeberblickAnzeigen },
  { kennung: 'fa-kontaktpflege', titel: 'Kontakte', zeichen: '◉', zeigen: faKontakteAnzeigen },
  { kennung: 'fa-menschen', titel: 'Team', zeichen: '◇', verwaltung: true, zeigen: faTeamAnzeigen },
  { kennung: 'fa-partnerschaften', titel: 'Partneranfragen', zeichen: '↗', verwaltung: true, zeigen: faPartnerAnzeigen },
  { kennung: 'fa-werbeplanung', titel: 'Kampagnen', zeichen: '▤', verwaltung: true, zeigen: faKampagnenAnzeigen },
  { kennung: 'fa-inhaltsmenschen', titel: 'Inhaltspartner', zeichen: '◈', verwaltung: true, zeigen: faInhalteAnzeigen },
  { kennung: 'fa-beitragsplanung', titel: 'Beiträge', zeichen: '≋', zeigen: faBeitraegeAnzeigen },
  { kennung: 'fa-eingangsbuch', titel: 'Zahlungseingänge', zeichen: '+', verwaltung: true, zeigen: faZahlungenAnzeigen },
  { kennung: 'fa-anteilsbuch', titel: 'Provisionen', zeichen: '€', zeigen: faProvisionenAnzeigen },
  { kennung: 'fa-abrechnungen', titel: 'Auszahlungen', zeichen: '↔', zeigen: faAuszahlungenAnzeigen },
  { kennung: 'fa-zahlenblick', titel: 'Auswertungen', zeichen: '▥', verwaltung: true, zeigen: faBerichtAnzeigen },
  { kennung: 'fa-mein-verweis', titel: 'Mein Formularlink', zeichen: '↗', zeigen: faLinksAnzeigen },
  { kennung: 'fa-konfiguration', titel: 'Einstellungen', zeichen: '⚙', zeigen: faEinstellungenAnzeigen },
  { kennung: 'fa-vorgangsbuch', titel: 'Änderungsprotokoll', zeichen: '≡', verwaltung: true, zeigen: faEreignisseAnzeigen },
];

function faZugangHinweis(faText) { faZugangsmeldung.textContent = faText; faZugangsmeldung.hidden = false; }
function faZugangZeigen() { faZugangskarte.hidden = false; faArbeitsbereich.hidden = true; document.title = 'Teamzentrale | F&A Sales Consulting'; }
function faMenueSchliessen() {
  document.querySelector('.fa-seitenleiste').classList.remove('fa-arbeitsmenue-offen');
  document.getElementById('fa-arbeitsmenue').setAttribute('aria-expanded', 'false');
}
function faNavigationAufbauen() {
  document.getElementById('fa-arbeitsnavigation').replaceChildren(...faAnsichten.filter((faAnsicht) => !faAnsicht.verwaltung || faIstVerwaltung()).map((faAnsicht) => faElement('a', { href: '#' + faAnsicht.kennung, aktionen: { click: faMenueSchliessen } }, faElement('span', { class: 'fa-navzeichen', 'aria-hidden': 'true' }, faAnsicht.zeichen), faAnsicht.titel)));
}
let faSeitenfolge = 0;
async function faAnsichtZeigen() {
  if (!faArbeitsstand.profil) return;
  const faFolge = ++faSeitenfolge;
  const faGewuenscht = location.hash.slice(1) || 'fa-ueberblick';
  const faAnsicht = faAnsichten.find((faZeile) => faZeile.kennung === faGewuenscht && (!faZeile.verwaltung || faIstVerwaltung()));
  if (!faAnsicht) { location.hash = 'fa-ueberblick'; return; }
  if (faDialog.open) faDialog.close();
  document.querySelectorAll('#fa-arbeitsnavigation a').forEach((faVerweis) => faVerweis.setAttribute('aria-current', faVerweis.hash === '#' + faAnsicht.kennung ? 'page' : 'false'));
  faArbeitsinhalt.replaceChildren(faElement('p', { class: 'fa-ladezustand', role: 'status' }, 'Arbeitsbereich wird geladen …'));
  document.title = faAnsicht.titel + ' | F&A Teamzentrale';
  try {
    const faNeuProfil = await faFunktion('fa_mein_profil');
    if (!faNeuProfil || !['inhaber', 'verwaltung', 'recruiting'].includes(faNeuProfil.aufgabe)) {
      faArbeitsstand.profil = null; await faAbmelden(); faZugangZeigen(); faZugangHinweis('Dieser Zugang ist derzeit nicht freigegeben. Bitte wende dich an die Zugangsverwaltung.'); return;
    }
    faArbeitsstand.profil = faNeuProfil;
    if (faAnsicht.verwaltung && !faIstVerwaltung()) { location.hash = 'fa-ueberblick'; return; }
    [faArbeitsstand.personen, faArbeitsstand.inhalte] = await Promise.all([faFunktion('fa_auswahl'), faIstVerwaltung() ? faZeilen('fa_inhaltspartner') : Promise.resolve([])]);
    faNavigationAufbauen();
    document.querySelectorAll('#fa-arbeitsnavigation a').forEach((faVerweis) => faVerweis.setAttribute('aria-current', faVerweis.hash === '#' + faAnsicht.kennung ? 'page' : 'false'));
    const faSeite = await faAnsicht.zeigen();
    if (faFolge !== faSeitenfolge) return;
    faArbeitsinhalt.replaceChildren(faSeite);
    window.scrollTo(0, 0);
  } catch (faFehler) {
    if (faFolge !== faSeitenfolge) return;
    if (!faHatSitzung()) { faArbeitsstand.profil = null; faZugangZeigen(); faZugangHinweis('Deine Sitzung ist abgelaufen. Bitte melde dich neu an.'); return; }
    faArbeitsinhalt.replaceChildren(faLeerzustand('Dieser Bereich konnte nicht geladen werden.', faFehler.message), faKnopf('Noch einmal laden', faAnsichtZeigen));
  }
}
faArbeitsstand.neuLaden = faAnsichtZeigen;

async function faArbeitsbeginn() {
  faArbeitsstand.profil = await faFunktion('fa_mein_profil');
  if (!faArbeitsstand.profil || !['inhaber', 'verwaltung', 'recruiting'].includes(faArbeitsstand.profil.aufgabe)) throw new Error('Dein Zugang ist noch nicht für die Teamzentrale freigeschaltet. Bitte wende dich an die Zugangsverwaltung.');
  document.getElementById('fa-personenanzeige').textContent = faArbeitsstand.profil.anzeigename;
  document.getElementById('fa-rollenanzeige').textContent = faAufgaben[faArbeitsstand.profil.aufgabe];
  faZugangskarte.hidden = true; faArbeitsbereich.hidden = false;
  await faAnsichtZeigen();
}

faAnmeldeformular.addEventListener('submit', async (faAktion) => {
  faAktion.preventDefault(); if (!faAnmeldeformular.reportValidity()) return;
  const faSchalter = faAnmeldeformular.querySelector('button[type=submit]'); faSchalter.disabled = true; faZugangsmeldung.hidden = true;
  try {
    await faAnmelden(document.getElementById('fa-anmeldepostfach').value.trim(), document.getElementById('fa-anmeldegeheimnis').value);
    document.getElementById('fa-anmeldegeheimnis').value = ''; await faArbeitsbeginn();
  } catch (faFehler) { faZugangHinweis(faFehler.message || 'Die Anmeldung ist fehlgeschlagen.'); }
  finally { faSchalter.disabled = false; }
});
document.getElementById('fa-zugangshilfe').addEventListener('click', async (faAktion) => {
  const faPostfach = document.getElementById('fa-anmeldepostfach');
  if (!faPostfach.value.trim() || !faPostfach.checkValidity()) { faZugangHinweis('Trage zuerst deine E-Mail-Adresse ein.'); faPostfach.focus(); return; }
  faAktion.currentTarget.disabled = true;
  try { await faPasswortAnfordern(faPostfach.value.trim()); faZugangHinweis('Falls ein passender Zugang besteht, erhältst du eine E-Mail zum Zurücksetzen.'); }
  catch { faZugangHinweis('Der Vorgang konnte nicht abgeschlossen werden. Bitte wende dich an die Zugangsverwaltung.'); }
  finally { document.getElementById('fa-zugangshilfe').disabled = false; }
});
faPasswortformular.addEventListener('submit', async (faAktion) => {
  faAktion.preventDefault(); if (!faPasswortformular.reportValidity()) return;
  const faNeu = document.getElementById('fa-neuesgeheimnis').value;
  if (faNeu !== document.getElementById('fa-geheimniswiederholung').value) { faZugangHinweis('Die Passwörter stimmen noch nicht überein.'); return; }
  const faSchalter = faPasswortformular.querySelector('button'); faSchalter.disabled = true;
  try { await faPasswortErsetzen(faNeu); faPasswortformular.reset(); faPasswortformular.hidden = true; faAnmeldeformular.hidden = false; await faArbeitsbeginn(); }
  catch (faFehler) { faZugangHinweis(faFehler.message || 'Das Passwort konnte nicht übernommen werden.'); }
  finally { faSchalter.disabled = false; }
});
document.getElementById('fa-abmelden').addEventListener('click', async () => {
  try { await faAbmelden(); } catch { /* Der lokale Zugang wird auch bei einer Verbindungsstörung entfernt. */ }
  faArbeitsstand.profil = null; faSeitenfolge++; faArbeitsinhalt.replaceChildren(); faMenueSchliessen(); faZugangZeigen();
  faZugangsmeldung.hidden = true; history.replaceState(null, '', location.pathname);
});
document.getElementById('fa-dialogschliessen').addEventListener('click', () => faDialog.close());
document.getElementById('fa-arbeitsmenue').addEventListener('click', (faAktion) => {
  const faOffen = faAktion.currentTarget.getAttribute('aria-expanded') !== 'true';
  faAktion.currentTarget.setAttribute('aria-expanded', String(faOffen)); document.querySelector('.fa-seitenleiste').classList.toggle('fa-arbeitsmenue-offen', faOffen);
});
document.addEventListener('keydown', (faAktion) => { if (faAktion.key === 'Escape') faMenueSchliessen(); });
window.addEventListener('hashchange', faAnsichtZeigen);

if (!faVerbindungBereit()) {
  faAnmeldeformular.querySelectorAll('input,button').forEach((faEingabe) => { faEingabe.disabled = true; });
  faZugangHinweis('Dieser Arbeitsbereich wird neu eingerichtet. Sobald die Verbindung freigegeben ist, kannst du dich hier anmelden. Bei Fragen erreichst du die Zugangsverwaltung über info@fasalesconsulting.com.');
} else {
  try {
    if (faRueckkehrLesen()) {
      faAnmeldeformular.hidden = true; faPasswortformular.hidden = false;
      document.getElementById('fa-zugangstitel').textContent = 'Dein Passwort festlegen.';
      document.getElementById('fa-zugangstext').textContent = 'Wähle ein eigenes Passwort mit mindestens zwölf Zeichen.';
    } else if (faHatSitzung()) await faArbeitsbeginn();
  } catch (faFehler) { faZugangZeigen(); faZugangHinweis(faFehler.message); }
}
