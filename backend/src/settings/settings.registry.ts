import { SettingScope, SettingType } from '@prisma/client';

export interface SettingDefinition {
  key: string;
  value: string;
  type: SettingType;
  scope: SettingScope;
  description: string;
}

export const SETTINGS_REGISTRY: SettingDefinition[] = [
  {
    key: 'club.name',
    value: 'FK Gračanica',
    type: SettingType.STRING,
    scope: SettingScope.PUBLIC,
    description: 'Naziv kluba',
  },
  {
    key: 'club.tagline',
    value: 'Zajedno za klub',
    type: SettingType.STRING,
    scope: SettingScope.PUBLIC,
    description: 'Slogan kluba',
  },
  {
    key: 'club.crestUrl',
    value: '',
    type: SettingType.STRING,
    scope: SettingScope.PUBLIC,
    description: 'Grb kluba (PNG upload) — logo u headeru i favicon',
  },
  {
    key: 'contact.email',
    value: 'info@fkgracanica.ba',
    type: SettingType.STRING,
    scope: SettingScope.PUBLIC,
    description: 'Kontakt email',
  },
  {
    key: 'contact.phone',
    value: '',
    type: SettingType.STRING,
    scope: SettingScope.PUBLIC,
    description: 'Kontakt telefon',
  },
  {
    key: 'contact.address',
    value: '',
    type: SettingType.STRING,
    scope: SettingScope.PUBLIC,
    description: 'Adresa kluba',
  },
  {
    key: 'seo.title',
    value: 'FK Gračanica',
    type: SettingType.STRING,
    scope: SettingScope.PUBLIC,
    description: 'SEO naslov',
  },
  {
    key: 'seo.description',
    value: '',
    type: SettingType.STRING,
    scope: SettingScope.PUBLIC,
    description: 'SEO opis',
  },
  {
    key: 'modules.news',
    value: 'true',
    type: SettingType.BOOLEAN,
    scope: SettingScope.PUBLIC,
    description: 'Prikaz modula vijesti',
  },
  {
    key: 'modules.gallery',
    value: 'true',
    type: SettingType.BOOLEAN,
    scope: SettingScope.PUBLIC,
    description: 'Prikaz modula galerija',
  },
  {
    key: 'modules.ticketing',
    value: 'true',
    type: SettingType.BOOLEAN,
    scope: SettingScope.PUBLIC,
    description: 'Prikaz modula ulaznice',
  },
  {
    key: 'smtp.host',
    value: '',
    type: SettingType.STRING,
    scope: SettingScope.PRIVATE,
    description: 'SMTP host',
  },
  {
    key: 'smtp.port',
    value: '587',
    type: SettingType.NUMBER,
    scope: SettingScope.PRIVATE,
    description: 'SMTP port',
  },
  {
    key: 'feature.live',
    value: 'true',
    type: SettingType.BOOLEAN,
    scope: SettingScope.PRIVATE,
    description: 'Omogući live centar',
  },
  {
    key: 'feature.membership',
    value: 'true',
    type: SettingType.BOOLEAN,
    scope: SettingScope.PRIVATE,
    description: 'Omogući članstvo',
  },
  {
    key: 'live.prematchAudioUrl',
    value: '',
    type: SettingType.STRING,
    scope: SettingScope.PUBLIC,
    description: 'YouTube URL pozadinske muzike prije početka live utakmice',
  },
  {
    key: 'upload.maxSizeMb',
    value: '10',
    type: SettingType.NUMBER,
    scope: SettingScope.PRIVATE,
    description: 'Maksimalna veličina uploada (MB)',
  },
];
