export type AdminNavLeaf = { to: string; label: string; perms: string[]; external?: boolean };
export type AdminNavGroup = { label: string; items: AdminNavLeaf[] };

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Pregled',
    items: [
      { to: '/admin', label: 'Kontrolna tabla', perms: ['dashboard.read', 'news.manage', 'gallery.manage', 'live.manage', 'news.approve', 'gallery.approve', 'live.approve'] },
      { to: '/admin/stanje', label: 'Stanje platforme', perms: ['dashboard.read'] },
      { to: '/admin/analitika', label: 'Analitika', perms: ['analytics.read'] },
      { to: '/', label: 'Javni sajt', perms: ['dashboard.read'], external: true },
    ],
  },
  {
    label: 'Sadržaj',
    items: [
      { to: '/admin/cms', label: 'CMS', perms: ['cms.manage'] },
      { to: '/admin/mediji', label: 'Mediji', perms: ['media.read', 'media.manage', 'media.upload'] },
      { to: '/admin/vijesti', label: 'Vijesti', perms: ['news.manage', 'news.submit', 'news.approve'] },
      { to: '/admin/galerija', label: 'Galerija', perms: ['gallery.manage', 'gallery.approve'] },
      { to: '/admin/komunikacije', label: 'Komunikacije', perms: ['contact.read', 'newsletter.read'] },
    ],
  },
  {
    label: 'Klub',
    items: [
      { to: '/admin/timeline', label: 'Historija', perms: ['club-timeline.manage'] },
      { to: '/admin/klub', label: 'Klub i sastav', perms: ['clubs.manage', 'players.manage'] },
      { to: '/admin/sponzori', label: 'Sponzori', perms: ['sponsors.manage'] },
      { to: '/admin/trofeji', label: 'Trofeji', perms: ['trophies.manage'] },
      { to: '/admin/naslijede', label: 'Naslijeđe', perms: ['hall-of-fame.manage', 'museum.manage'] },
    ],
  },
  {
    label: 'Takmičenja',
    items: [
      { to: '/admin/takmicenja', label: 'Takmičenja', perms: ['competitions.manage', 'matches.manage'] },
      { to: '/admin/live', label: 'Live na čekanju', perms: ['live.approve', 'live.manage'] },
    ],
  },
  {
    label: 'Monetizacija',
    items: [
      { to: '/admin/clanstvo-admin', label: 'Članstvo', perms: ['membership.manage'] },
      { to: '/admin/ulaznice-admin', label: 'Ulaznice', perms: ['ticketing.manage'] },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { to: '/admin/postavke', label: 'Postavke', perms: ['settings.read'] },
      { to: '/admin/korisnici', label: 'Korisnici i role', perms: ['users.read', 'rbac.read'] },
      { to: '/admin/audit', label: 'Audit', perms: ['audit.read'] },
    ],
  },
];
