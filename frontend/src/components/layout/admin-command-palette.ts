import { hasPermission } from '../../lib/permissions';
import type { AdminNavGroup } from './admin-nav-groups';
import type { TFunction } from 'i18next';

export type Command = {
  id: string;
  to: string;
  label: string;
  group: string;
  keywords: string;
  external?: boolean;
};

/** Brze akcije koje nisu stavke menija (duboke rute i „novo …"). */
const ACTIONS: Array<Omit<Command, 'group'> & { permissions: string[] }> = [
  {
    id: 'news-new',
    to: '/admin/news/new',
    label: 'Nova vijest',
    keywords: 'news nova vijest clanaak tekst',
    permissions: ['news.manage', 'news.submit'],
  },
  {
    id: 'gallery-new',
    to: '/admin/gallery/new',
    label: 'Novi album',
    keywords: 'galerija album slike fotografije',
    permissions: ['gallery.manage'],
  },
  {
    id: 'media-new',
    to: '/admin/media',
    label: 'Mediji i mape',
    keywords: 'mediji fajlovi upload mape slike',
    permissions: ['media.manage', 'media.read', 'media.upload'],
  },
  {
    id: 'cms',
    to: '/admin/cms',
    label: 'CMS stranice i meni',
    keywords: 'cms stranice meni sadrzaj seo',
    permissions: ['cms.manage'],
  },
  {
    id: 'users',
    to: '/admin/users',
    label: 'Korisnici i role',
    keywords: 'korisnici role dozvole rbac',
    permissions: ['users.read', 'rbac.read'],
  },
  {
    id: 'settings',
    to: '/admin/settings',
    label: 'Postavke',
    keywords: 'postavke settings konfiguracija moduli',
    permissions: ['settings.read'],
  },
];

/** Bez dijakritike, mala slova — „Galerija" i „galerija" se nalaze isto. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Filtriranje komandi: svaka riječ upita mora se naći u labeli, grupi ili
 * ključnim riječima. Prefiks labele ide prvi („vij" → „Vijesti" prije „Nova vijest").
 */
export function filterCommands(commands: Command[], query: string): Command[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return commands;
  const scored = commands
    .map((command) => {
      const haystack = normalize(`${command.label} ${command.group} ${command.keywords}`);
      if (!words.every((w) => haystack.includes(w))) return null;
      const label = normalize(command.label);
      const score = label.startsWith(words[0]) ? 0 : label.includes(words[0]) ? 1 : 2;
      return { command, score };
    })
    .filter((x): x is { command: Command; score: number } => x !== null);
  return scored.sort((a, b) => a.score - b.score).map((x) => x.command);
}

/** Spaja stavke menija (već filtrirane po dozvolama) i brze akcije. */
export function buildCommands({
  groups,
  permissions,
  t,
}: {
  groups: AdminNavGroup[];
  permissions: string[] | undefined;
  t: TFunction;
}): Command[] {
  const fromNav = groups.flatMap((group) =>
    group.items.map((item) => ({
      id: item.to,
      to: item.to,
      label: t(item.labelKey),
      group: t(group.labelKey),
      keywords: '',
      external: item.external,
    })),
  );
  const fromActions = ACTIONS.filter((action) =>
    action.permissions.some((p) => hasPermission(permissions, p)),
  ).map(({ permissions: _permissions, ...action }) => ({
    ...action,
    group: t('admin.cmdkActions', 'Brze akcije'),
  }));
  const seen = new Set<string>();
  return [...fromNav, ...fromActions].filter((command) => {
    const key = command.to + command.label;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
