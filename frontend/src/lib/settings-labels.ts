export const SETTINGS_LABELS: Record<string, string> = {
  'club.name': 'Naziv kluba',
  'club.tagline': 'Slogan kluba',
  'club.crestUrl': 'Grb kluba',
  'contact.email': 'Kontakt email',
  'contact.phone': 'Kontakt telefon',
  'contact.address': 'Adresa kluba',
  'seo.title': 'SEO naslov',
  'seo.description': 'SEO opis',
  'smtp.host': 'SMTP host',
  'smtp.port': 'SMTP port',
  'smtp.user': 'SMTP korisničko ime',
  'smtp.pass': 'SMTP lozinka',
  'smtp.from': 'SMTP pošiljalac (from)',
  'smtp.secure': 'SMTP TLS/SSL',
  'newsletter.blastEnabled': 'Newsletter kampanje',
  'live.prematchAudioUrl': 'Pre-match audio (YouTube)',
  'upload.maxSizeMb': 'Maks. veličina uploada (MB)',
  'showcase.launchNote': 'Napomena o lansiranju',
};

export const SETTINGS_DESCRIPTIONS: Record<string, string> = {
  'club.name': 'Prikazuje se u headeru, podnožju i SEO naslovu.',
  'club.tagline': 'Kratki slogan kluba na javnom sajtu.',
  'club.crestUrl': 'PNG grb — logo u headeru i favicon preglednika.',
  'contact.email': 'Javni email na kontakt stranici i u podnožju.',
  'contact.phone': 'Javni telefon na kontakt stranici i u podnožju.',
  'contact.address': 'Adresa kluba na javnom sajtu.',
  'seo.title': 'Zadani naslov stranice za pretraživače.',
  'seo.description': 'Zadani opis stranice za pretraživače i dijeljenje.',
  'smtp.host': 'Adresa SMTP servera za slanje emaila.',
  'smtp.port': 'Port SMTP servera (npr. 587 ili 465).',
  'smtp.user': 'Korisničko ime SMTP računa.',
  'smtp.pass': 'Lozinka SMTP računa. Nije vidljiva javnosti.',
  'smtp.from': 'Adresa pošiljaoca u odlaznim emailovima.',
  'smtp.secure': 'Uključi TLS/SSL za SMTP vezu.',
  'newsletter.blastEnabled':
    'Omogućava slanje kampanja svim aktivnim pretplatnicima. SMTP mora biti podešen.',
  'live.prematchAudioUrl':
    'YouTube link pozadinske muzike na live stranici dok je utakmica zakazana.',
  'upload.maxSizeMb': 'Maksimalna veličina fajla pri uploadu u medijsku biblioteku.',
  'showcase.launchNote': 'Kratka napomena na prezentacijskoj stranici dok je portal u izradi.',
};

export function settingLabel(key: string): string {
  return SETTINGS_LABELS[key] ?? key;
}

export function settingDescription(key: string): string | undefined {
  return SETTINGS_DESCRIPTIONS[key];
}
