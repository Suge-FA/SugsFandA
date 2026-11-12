// Nur die Werte DEINES NEUEN Projekts einsetzen. Der öffentliche Schlüssel darf hier stehen.
// Server-Schlüssel bleiben ausschließlich in den Geheimnissen der eigenen Edge Functions.
export const faProjekt = Object.freeze({
  unternehmen: 'Franz Dippel und Alexander Bobykin GbR',
  kurzname: 'F&A Sales Consulting',
  inhaber: 'Franz Dippel',
  postfach: 'info@fasalesconsulting.com',
  telefon: '+49 4442 9499987',
  webadresse: 'https://fasalesconsulting.com',
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
