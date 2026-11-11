import { faProjekt } from './projektwerte.js';

const faSchalter = document.querySelector('[data-fa-menuschalter]');
const faNavigation = document.querySelector('[data-fa-navigation]');
if (faSchalter && faNavigation) {
  const faMenueSetzen = (faOffen) => {
    faSchalter.setAttribute('aria-expanded', String(faOffen));
    faNavigation.classList.toggle('fa-navigation-offen', faOffen);
    faSchalter.textContent = faOffen ? 'Schließen' : 'Menü';
  };
  faSchalter.addEventListener('click', () => faMenueSetzen(faSchalter.getAttribute('aria-expanded') !== 'true'));
  faNavigation.querySelectorAll('a').forEach((faVerweis) => faVerweis.addEventListener('click', () => faMenueSetzen(false)));
  document.addEventListener('keydown', (faTastendruck) => {
    if (faTastendruck.key === 'Escape' && faSchalter.getAttribute('aria-expanded') === 'true') { faMenueSetzen(false); faSchalter.focus(); }
  });
}
document.querySelectorAll('[data-fa-postfach]').forEach((faVerweis) => {
  faVerweis.href = 'mailto:' + faProjekt.postfach;
  if (faVerweis.dataset.faPostfach === 'anzeigen') faVerweis.textContent = faProjekt.postfach;
});
document.querySelectorAll('[data-fa-telefon]').forEach((faVerweis) => {
  faVerweis.href = 'tel:' + faProjekt.telefon.replace(/[^+\d]/g, '');
  faVerweis.textContent = faProjekt.telefon;
});

// Neue Vermittlungskennungen bleiben beim Wechsel zum Formular erhalten. Kein Tracking-Speicher.
const faAnkunft = new URLSearchParams(location.search);
document.querySelectorAll('a[data-fa-einstieg]').forEach((faVerweis) => {
  const faZiel = new URL(faVerweis.href);
  ['betreuung', 'kampagne'].forEach((faBegriff) => {
    const faInhalt = faAnkunft.get(faBegriff);
    if (faInhalt && /^[a-z0-9-]{1,64}$/i.test(faInhalt)) faZiel.searchParams.set(faBegriff, faInhalt);
  });
  faVerweis.href = faZiel.href;
});
