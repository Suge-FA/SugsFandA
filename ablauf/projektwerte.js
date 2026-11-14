// Nur die Werte DEINES NEUEN Projekts einsetzen. Der öffentliche Schlüssel darf hier stehen.
// Server-Schlüssel bleiben ausschließlich in den Geheimnissen der eigenen Edge Functions.
export const faProjekt = Object.freeze({
  unternehmen: 'F&A Sales Consulting',
  kurzname: 'F&A Sales Consulting',
  postfach: 'info@fasalesconsulting.com',
  telefon: '+49 4442 9499987',
  webadresse: new URL('../', import.meta.url).href.replace(/\/$/, ''),
  datenadresse: '',
  oeffentlicherSchluessel: '',
});

export function faVerbindungBereit() {
  if (!faProjekt.datenadresse || !faProjekt.oeffentlicherSchluessel) return false;
  try {
    const faZiel = new URL(faProjekt.datenadresse);
    return faZiel.protocol === 'https:' && faZiel.hostname.endsWith('.supabase.co')
      && /^sb_publishable_[A-Za-z0-9_-]+$/.test(faProjekt.oeffentlicherSchluessel);
  } catch { return false; }
}
