import { faProjekt, faVerbindungBereit } from './projektwerte.js?v=20261114';

document.querySelectorAll('form[data-fa-anfrage]').forEach((faFormular) => {
  const faStatus = faFormular.querySelector('[data-fa-rueckmeldung]');
  const faErsatz = faFormular.querySelector('[data-fa-mailersatz]');
  const faSenden = faFormular.querySelector('button[type="submit"]');
  const faMelden = (faText, faErfolg = false) => {
    faStatus.hidden = false;
    faStatus.textContent = faText;
    faStatus.classList.toggle('fa-formular-erfolg', faErfolg);
    faStatus.focus();
  };
  faFormular.addEventListener('submit', async (faAktion) => {
    faAktion.preventDefault();
    if (!faFormular.reportValidity()) return;
    const faDaten = Object.fromEntries(new FormData(faFormular).entries());
    const faHerkunft = new URLSearchParams(location.search);
    ['betreuung', 'kampagne'].forEach((faBegriff) => {
      const faWert = faHerkunft.get(faBegriff);
      if (faWert && /^[a-z0-9-]{1,64}$/i.test(faWert)) faDaten[faBegriff] = faWert;
    });
    const faBetreff = faDaten.anliegen === 'vertrieb' ? 'Kennenlernen im Vertrieb' : 'Austausch zur Zusammenarbeit';
    const faFeldnamen = { anzeigename: 'Name', postfach: 'E-Mail', telefon: 'Telefon', unternehmen: 'Unternehmen', erfahrung: 'Erfahrung', nachricht: 'Nachricht' };
    const faNachricht = Object.entries(faFeldnamen).filter(([faFeld]) => faDaten[faFeld]).map(([faFeld, faTitel]) => faTitel + ': ' + faDaten[faFeld]).join('\n');
    faErsatz.href = 'mailto:' + faProjekt.postfach + '?subject=' + encodeURIComponent(faBetreff) + '&body=' + encodeURIComponent(faNachricht);
    if (!faVerbindungBereit()) {
      faErsatz.hidden = false;
      faMelden('Deine Angaben wurden noch nicht verschickt. Öffne bitte die vorbereitete E-Mail und sende sie in deinem E-Mail-Programm ab.');
      return;
    }
    faSenden.disabled = true;
    faSenden.textContent = 'Wird übermittelt …';
    faErsatz.hidden = true;
    try {
      const faAntwort = await fetch(faProjekt.datenadresse.replace(/\/$/, '') + '/functions/v1/fa-anfrage-eingang', {
        method: 'POST', headers: { apikey: faProjekt.oeffentlicherSchluessel, 'Content-Type': 'application/json' },
        body: JSON.stringify(faDaten), signal: AbortSignal.timeout(15000),
      });
      const faBestaetigung = await faAntwort.json();
      if (!faAntwort.ok || !faBestaetigung.angenommen) throw new Error(faBestaetigung.fehler || 'Übermittlung fehlgeschlagen');
      faFormular.reset();
      faMelden('Danke! Deine Anfrage ist eingegangen. Wir melden uns bei dir.', true);
    } catch {
      faErsatz.hidden = false;
      faMelden('Die Übermittlung konnte nicht bestätigt werden. Du kannst deine Nachricht über die vorbereitete E-Mail senden.');
    } finally {
      faSenden.disabled = false;
      faSenden.textContent = faFormular.dataset.faKnopf || 'Anfrage übermitteln';
    }
  });
});
