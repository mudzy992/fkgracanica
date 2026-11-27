export type AdminNavLeaf = { to: string; label: string; perms: string[] };
export type AdminNavGroup = { label: string; items: AdminNavLeaf[] };

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Pregled',
    items: [
      { to: '/admin', label: 'Kontrolna tabla', perms: ['dashboard.read'] },
      { to: '/admin/stanje', label: 'Stanje platforme', perms: ['dashboard.read'] },
    ],
  },
  {
    label: 'Sadržaj',
    items: [
      { to: '/admin/cms', label: 'CMS', perms: ['cms.manage'] },
      { to: '/admin/vijesti', label: 'Vijesti', perms: ['news.manage'] },
      { to: '/admin/galerija', label: 'Galerija', perms: ['gallery.manage'] },
      { to: '/admin/sponzori', label: 'Sponzori', perms: ['sponsors.manage'] },
    ],
  },
  {
    label: 'Klub',
    items: [
      { to: '/admin/tim', label: 'Tim', perms: ['players.manage'] },
      { to: '/admin/liga', label: 'Liga', perms: ['competitions.manage'] },
      { to: '/admin/trofeji', label: 'Trofeji', perms: ['trophies.manage'] },
    ],
  },
  {
    label: 'Administracija',
    items: [
      { to: '/admin/korisnici', label: 'Korisnici', perms: ['users.read'] },
      { to: '/admin/postavke', label: 'Postavke', perms: ['settings.read'] },
    ],
  },
];
