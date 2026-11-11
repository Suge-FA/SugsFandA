export function faBeispielBerechnen(faBasis, faQuote, faAnzahl) {
  const faSicher = (faWert, faUnten, faOben) => Math.min(faOben, Math.max(faUnten, Number(faWert) || 0));
  const faGrundlage = faSicher(faBasis, 0, 5000000);
  const faProzent = faSicher(faQuote, 0, 100);
  const faAbschluesse = Math.round(faSicher(faAnzahl, 0, 100));
  const faEinzeln = Math.round(faGrundlage * faProzent) / 100;
  return { einzeln: faEinzeln, insgesamt: faEinzeln * faAbschluesse, monatlich: faEinzeln * faAbschluesse / 12 };
}
const faRechenfeld = document.querySelector('[data-fa-beispiel]');
if (faRechenfeld) {
  const faEuro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  function faBeispielAnzeigen() {
    const faErgebnis = faBeispielBerechnen(
      faRechenfeld.elements.fa_grundlage.value,
      faRechenfeld.elements.fa_prozent.value,
      faRechenfeld.elements.fa_anzahl.value,
    );
    Object.entries(faErgebnis).forEach(([faSchluessel, faBetrag]) => {
      faRechenfeld.querySelector('[data-fa-ergebnis="' + faSchluessel + '"]').textContent = faEuro.format(faBetrag);
    });
  }
  faRechenfeld.addEventListener('input', faBeispielAnzeigen);
  faRechenfeld.addEventListener('submit', (faAktion) => faAktion.preventDefault());
  faBeispielAnzeigen();
}
