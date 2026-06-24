export const SETTINGS_LABELS: Record<string, string> = {
  'club.name': 'Naziv kluba',
  'club.tagline': 'Slogan kluba',
  'contact.email': 'Kontakt email',
  'contact.phone': 'Kontakt telefon',
  'contact.address': 'Adresa kluba',
  'seo.title': 'SEO naslov',
  'seo.description': 'SEO opis',
  'modules.news': 'Modul vijesti',
  'modules.gallery': 'Modul galerija',
  'modules.ticketing': 'Modul ulaznice',
  'smtp.host': 'SMTP host',
  'smtp.port': 'SMTP port',
  'feature.live': 'Live centar',
  'feature.membership': 'Članstvo',
  'upload.maxSizeMb': 'Maks. upload (MB)',
};

export function settingLabel(key: string): string {
  return SETTINGS_LABELS[key] ?? key;
}
