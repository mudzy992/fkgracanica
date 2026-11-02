import { SettingScope } from '@prisma/client';

export type AppModuleDefinition = {
  key: string;
  label: string;
  scope: SettingScope;
  requires: string[];
};

export const APP_MODULE_DEFINITIONS: AppModuleDefinition[] = [
  {
    key: 'modules.news',
    label: 'Vijesti',
    scope: SettingScope.PUBLIC,
    requires: [],
  },
  {
    key: 'modules.gallery',
    label: 'Galerija',
    scope: SettingScope.PUBLIC,
    requires: [],
  },
  {
    key: 'modules.cms',
    label: 'CMS stranice',
    scope: SettingScope.PUBLIC,
    requires: [],
  },
  {
    key: 'modules.media',
    label: 'Medijska biblioteka',
    scope: SettingScope.PUBLIC,
    requires: [],
  },
  {
    key: 'modules.timeline',
    label: 'Vremenska linija',
    scope: SettingScope.PUBLIC,
    requires: [],
  },
  {
    key: 'modules.clubs',
    label: 'Klub i kadar',
    scope: SettingScope.PUBLIC,
    requires: [],
  },
  {
    key: 'modules.competitions',
    label: 'Takmičenja i utakmice',
    scope: SettingScope.PUBLIC,
    requires: [],
  },
  {
    key: 'feature.live',
    label: 'Live centar',
    scope: SettingScope.PRIVATE,
    requires: ['modules.competitions'],
  },
  {
    key: 'modules.sponsors',
    label: 'Sponzori',
    scope: SettingScope.PUBLIC,
    requires: [],
  },
  {
    key: 'modules.trophies',
    label: 'Trofeji',
    scope: SettingScope.PUBLIC,
    requires: [],
  },
  {
    key: 'modules.hallOfFame',
    label: 'Hall of Fame',
    scope: SettingScope.PUBLIC,
    requires: [],
  },
  {
    key: 'modules.museum',
    label: 'Muzej',
    scope: SettingScope.PUBLIC,
    requires: [],
  },
  {
    key: 'modules.ticketing',
    label: 'Ulaznice',
    scope: SettingScope.PUBLIC,
    requires: [],
  },
  {
    key: 'feature.membership',
    label: 'Članstvo',
    scope: SettingScope.PRIVATE,
    requires: [],
  },
  {
    key: 'modules.contact',
    label: 'Kontakt',
    scope: SettingScope.PUBLIC,
    requires: [],
  },
  {
    key: 'modules.newsletter',
    label: 'Newsletter',
    scope: SettingScope.PUBLIC,
    requires: [],
  },
  {
    key: 'feature.showcaseMode',
    label: 'Prezentacija / u izradi',
    scope: SettingScope.PRIVATE,
    requires: [],
  },
];

export const APP_MODULE_KEYS = new Set(
  APP_MODULE_DEFINITIONS.map((m) => m.key),
);
