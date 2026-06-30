export const SETTINGS_LABELS: Record<string, string> = {
  'club.name': 'Naziv kluba',
  'club.tagline': 'Slogan kluba',
  'club.crestUrl': 'Grb kluba (PNG) — logo i favicon',
  'contact.email': 'Kontakt email',
  'contact.phone': 'Kontakt telefon',
  'contact.address': 'Adresa kluba',
  'seo.title': 'SEO naslov',
  'seo.description': 'SEO opis',
  'smtp.host': 'SMTP host',
  'smtp.port': 'SMTP port',
  'live.prematchAudioUrl': 'YouTube URL — pre-match audio (live centar)',
  'upload.maxSizeMb': 'Maks. upload (MB)',
};

export const SETTINGS_DESCRIPTIONS: Record<string, string> = {
  'live.prematchAudioUrl':
    'Pozadinska muzika na /live/:id dok je utakmica zakazana (SCHEDULED). Unesite YouTube link — audio se pušta automatski.',
};

export function settingLabel(key: string): string {
  return SETTINGS_LABELS[key] ?? key;
}

export function settingDescription(key: string): string | undefined {
  return SETTINGS_DESCRIPTIONS[key];
}
