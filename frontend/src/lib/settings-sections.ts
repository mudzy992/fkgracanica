export type SettingsFieldGroup = {
  id: string;
  title: string;
  description?: string;
  keyPrefixes: string[];
  scope: 'public' | 'private';
};

export const SETTINGS_MODULES_TAB = {
  id: 'modules',
  title: 'Moduli',
  description: 'Uključite ili isključite funkcionalnosti aplikacije',
  scope: 'public' as const,
};

export const SETTINGS_FIELD_GROUPS: SettingsFieldGroup[] = [
  {
    id: 'identity',
    title: 'Identitet kluba',
    scope: 'public',
    keyPrefixes: ['club.'],
  },
  {
    id: 'contact',
    title: 'Kontakt podaci',
    description: 'Prikaz na javnom sajtu i u podnožju',
    scope: 'public',
    keyPrefixes: ['contact.'],
  },
  {
    id: 'seo',
    title: 'SEO',
    scope: 'public',
    keyPrefixes: ['seo.'],
  },
  {
    id: 'showcase',
    title: 'Prezentacija',
    description: 'Napomena na stranici „u izradi” / /platforma',
    scope: 'public',
    keyPrefixes: ['showcase.'],
  },
  {
    id: 'live',
    title: 'Live centar',
    description: 'Javne postavke za live stranicu',
    scope: 'public',
    keyPrefixes: ['live.prematchAudioUrl'],
  },
  {
    id: 'smtp',
    title: 'Email (SMTP)',
    scope: 'private',
    keyPrefixes: ['smtp.', 'newsletter.blastEnabled'],
  },
  {
    id: 'system',
    title: 'Sistem',
    scope: 'private',
    keyPrefixes: ['upload.'],
  },
];

export type SettingsTab = {
  id: string;
  title: string;
  description?: string;
  kind: 'modules' | 'fields';
  group?: SettingsFieldGroup;
};

export function getSettingsTabs(
  scope: 'public' | 'private',
  hasFieldKeys: (group: SettingsFieldGroup) => boolean,
  isLiveEnabled: boolean,
): SettingsTab[] {
  const tabs: SettingsTab[] = [
    {
      id: SETTINGS_MODULES_TAB.id,
      title: SETTINGS_MODULES_TAB.title,
      description: SETTINGS_MODULES_TAB.description,
      kind: 'modules',
    },
  ];

  for (const group of SETTINGS_FIELD_GROUPS.filter((g) => g.scope === scope)) {
    if (group.id === 'live' && !isLiveEnabled) continue;
    if (!hasFieldKeys(group)) continue;
    tabs.push({ id: group.id, title: group.title, description: group.description, kind: 'fields', group });
  }

  return tabs;
}
