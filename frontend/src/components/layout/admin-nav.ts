export type AdminNavItem = {
  to: string;
  labelKey: string;
  end?: boolean;
  permissions: string[];
};

export const adminNav: AdminNavItem[] = [
  { to: '/admin', labelKey: 'admin.dashboard', end: true, permissions: ['dashboard.read'] },
  { to: '/admin/settings', labelKey: 'admin.settings', permissions: ['settings.read'] },
  { to: '/admin/users', labelKey: 'admin.users', permissions: ['users.read'] },
  { to: '/admin/roles', labelKey: 'admin.roles', permissions: ['rbac.read'] },
  { to: '/admin/cms', labelKey: 'admin.cms', permissions: ['cms.manage'] },
  { to: '/admin/media', labelKey: 'admin.media', permissions: ['media.manage'] },
  { to: '/admin/audit', labelKey: 'admin.audit', permissions: ['audit.read'] },
  {
    to: '/admin/notifications',
    labelKey: 'notifications.title',
    permissions: ['dashboard.read', 'news.manage', 'news.submit', 'gallery.manage', 'live.manage'],
  },
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
  { to: '/admin/sponsors', labelKey: 'admin.sponsors', permissions: ['sponsors.manage'] },
  { to: '/admin/trophies', labelKey: 'admin.trophies', permissions: ['trophies.manage'] },
  { to: '/admin/club-timeline', labelKey: 'admin.timeline', permissions: ['club-timeline.manage'] },
  {
    to: '/admin/clubs',
    labelKey: 'admin.clubSquad',
    permissions: ['clubs.manage', 'players.manage'],
  },
  {
    to: '/admin/competitions',
    labelKey: 'admin.competitions',
    permissions: ['competitions.manage', 'matches.manage'],
  },
  { to: '/admin/live/pending', labelKey: 'admin.livePending', permissions: ['live.approve'] },
  { to: '/admin/membership', labelKey: 'admin.membership', permissions: ['membership.manage'] },
  { to: '/admin/ticketing', labelKey: 'admin.ticketing', permissions: ['ticketing.manage'] },
  { to: '/admin/contact', labelKey: 'admin.contact', permissions: ['contact.read'] },
  { to: '/admin/newsletter', labelKey: 'admin.newsletter', permissions: ['newsletter.read'] },
  { to: '/admin/hall-of-fame', labelKey: 'admin.hallOfFame', permissions: ['hall-of-fame.manage'] },
  { to: '/admin/museum', labelKey: 'admin.museum', permissions: ['museum.manage'] },
];

export function filterAdminNav(permissions: string[] | undefined): AdminNavItem[] {
  if (!permissions?.length) return [];
  return adminNav.filter((item) => item.permissions.some((p) => permissions.includes(p)));
}
