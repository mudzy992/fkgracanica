export type AdminNavLeaf = {
  to: string;
  labelKey: string;
  end?: boolean;
  external?: boolean;
  permissions: string[];
  /** Ako je set — modul vidljiv kad je bilo koji uključen (npr. heritage hub). */
  moduleKeys?: string[];
};

export type AdminNavGroup = {
  labelKey: string;
  items: AdminNavLeaf[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    labelKey: 'admin.navGroup.overview',
    items: [
      { to: '/admin', labelKey: 'admin.dashboard', end: true, permissions: ['dashboard.read'] },
      { to: '/admin/stanje', labelKey: 'admin.stanje', permissions: ['dashboard.read'] },
      {
        to: '/',
        labelKey: 'admin.publicSite',
        end: true,
        external: true,
        permissions: ['dashboard.read'],
      },
      {
        to: '/admin/notifications',
        labelKey: 'notifications.title',
        permissions: ['dashboard.read', 'news.manage', 'news.submit', 'gallery.manage', 'live.manage'],
      },
      { to: '/admin/audit', labelKey: 'admin.audit', permissions: ['audit.read'] },
    ],
  },
  {
    labelKey: 'admin.navGroup.system',
    items: [
      { to: '/admin/settings', labelKey: 'admin.settings', permissions: ['settings.read'] },
      { to: '/admin/users', labelKey: 'admin.usersAndRoles', permissions: ['users.read', 'rbac.read'] },
    ],
  },
  {
    labelKey: 'admin.navGroup.content',
    items: [
      { to: '/admin/cms', labelKey: 'admin.cms', permissions: ['cms.manage'] },
      { to: '/admin/media', labelKey: 'admin.media', permissions: ['media.manage'] },
      {
        to: '/admin/news',
        labelKey: 'admin.news',
        permissions: ['news.manage', 'news.submit', 'news.approve'],
      },
      {
        to: '/admin/gallery',
        labelKey: 'admin.gallery',
        permissions: ['gallery.manage', 'gallery.approve'],
      },
    ],
  },
  {
    labelKey: 'admin.navGroup.club',
    items: [
      { to: '/admin/club-timeline', labelKey: 'admin.timeline', permissions: ['club-timeline.manage'] },
      {
        to: '/admin/clubs',
        labelKey: 'admin.clubSquad',
        permissions: ['clubs.manage', 'players.manage'],
      },
      { to: '/admin/sponsors', labelKey: 'admin.sponsors', permissions: ['sponsors.manage'] },
      { to: '/admin/trophies', labelKey: 'admin.trophies', permissions: ['trophies.manage'] },
    ],
  },
  {
    labelKey: 'admin.navGroup.competitions',
    items: [
      {
        to: '/admin/competitions',
        labelKey: 'admin.competitions',
        permissions: ['competitions.manage', 'matches.manage'],
      },
      { to: '/admin/live/pending', labelKey: 'admin.livePending', permissions: ['live.approve'] },
      { to: '/admin/analytics', labelKey: 'admin.analytics', permissions: ['analytics.read'] },
    ],
  },
  {
    labelKey: 'admin.navGroup.heritage',
    items: [
      {
        to: '/admin/heritage',
        labelKey: 'admin.heritage',
        permissions: ['hall-of-fame.manage', 'museum.manage'],
        moduleKeys: ['modules.hallOfFame', 'modules.museum'],
      },
    ],
  },
  {
    labelKey: 'admin.navGroup.comms',
    items: [
      {
        to: '/admin/comms',
        labelKey: 'admin.comms',
        permissions: ['contact.read', 'newsletter.read'],
        moduleKeys: ['modules.contact', 'modules.newsletter'],
      },
    ],
  },
  {
    labelKey: 'admin.navGroup.monetization',
    items: [
      { to: '/admin/membership', labelKey: 'admin.membership', permissions: ['membership.manage'] },
      { to: '/admin/ticketing', labelKey: 'admin.ticketing', permissions: ['ticketing.manage'] },
    ],
  },
];

export function filterNavLeaves(
  permissions: string[] | undefined,
  isModuleVisible: (item: AdminNavLeaf) => boolean,
): AdminNavGroup[] {
  if (!permissions?.length) return [];

  return ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.permissions.some((p) => permissions.includes(p)) && isModuleVisible(item),
    ),
  })).filter((g) => g.items.length > 0);
}
