export type AppModuleDefinition = {
  key: string;
  label: string;
  scope: 'public' | 'private';
  description?: string;
  requires: string[];
};

export const APP_MODULE_DEFINITIONS: AppModuleDefinition[] = [
  { key: 'modules.news', label: 'Vijesti', scope: 'public', requires: [], description: 'Javne vijesti i admin modul' },
  { key: 'modules.gallery', label: 'Galerija', scope: 'public', requires: [], description: 'Foto galerije' },
  { key: 'modules.cms', label: 'CMS stranice', scope: 'public', requires: [], description: 'Page builder i meni' },
  { key: 'modules.media', label: 'Medijska biblioteka', scope: 'public', requires: [], description: 'Upload i odabir medija' },
  { key: 'modules.timeline', label: 'Vremenska linija', scope: 'public', requires: [], description: 'Historija kluba' },
  { key: 'modules.clubs', label: 'Klub i kadar', scope: 'public', requires: [], description: 'Timovi, igrači, formacija' },
  {
    key: 'modules.competitions',
    label: 'Takmičenja i utakmice',
    scope: 'public',
    requires: [],
    description: 'Liga, kola, raspored',
  },
  {
    key: 'feature.live',
    label: 'Live centar',
    scope: 'private',
    requires: ['modules.competitions'],
    description: 'Komentator i live odobrenje',
  },
  { key: 'modules.sponsors', label: 'Sponzori', scope: 'public', requires: [], description: 'Sponzori kluba' },
  { key: 'modules.trophies', label: 'Trofeji', scope: 'public', requires: [], description: 'Trofeji i plasmani' },
  { key: 'modules.hallOfFame', label: 'Hall of Fame', scope: 'public', requires: [], description: 'Zaslužni igrači' },
  { key: 'modules.museum', label: 'Muzej', scope: 'public', requires: [], description: 'Eksponati muzeja' },
  { key: 'modules.ticketing', label: 'Ulaznice', scope: 'public', requires: [], description: 'Prodaja ulaznica' },
  { key: 'feature.membership', label: 'Članstvo', scope: 'private', requires: [], description: 'Članarine i kartice' },
  { key: 'modules.contact', label: 'Kontakt', scope: 'public', requires: [], description: 'Kontakt forma' },
  { key: 'modules.newsletter', label: 'Newsletter', scope: 'public', requires: [], description: 'Pretplata na vijesti' },
  {
    key: 'feature.showcaseMode',
    label: 'Prezentacija / u izradi',
    scope: 'private',
    requires: [],
    description: 'Javnost vidi prezentaciju platforme umjesto portala. Admin, prijava i staff rade.',
  },
];

export const APP_MODULE_KEYS = new Set(APP_MODULE_DEFINITIONS.map((m) => m.key));
