/**
 * BE-09c/P-B09c-5: definicija rola i njihovih dozvola živi u `src/` (a ne u
 * `prisma/seed/rbac.ts`) da bi je pokrivao test koji provjerava da svaki ključ
 * postoji u `PERMISSIONS` — prije je litera greška tiho ostavljala rolu bez
 * dozvole.
 */
import { ALL_PERMISSION_KEYS } from '../common/constants/permissions';

export const ROLES = [
  { name: 'Administrator', description: 'Potpuna kontrola nad sistemom' },
  { name: 'Moderator', description: 'Upravljanje sadržajem i odobravanje' },
  { name: 'Writer', description: 'Kreiranje sadržaja' },
  { name: 'Komentator', description: 'Vođenje live utakmica' },
  {
    name: 'Redar',
    description: 'Ulaz — skeniranje ulaznica i članskih kartica',
  },
  { name: 'Član', description: 'Član kluba' },
] as const;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  Administrator: ALL_PERMISSION_KEYS,
  Moderator: [
    'dashboard.read',
    'news.manage',
    'news.approve',
    'gallery.manage',
    'gallery.approve',
    'sponsors.manage',
    'trophies.manage',
    'club-timeline.manage',
    'contact.read',
    'newsletter.read',
    'newsletter.manage',
    'cms.manage',
    'media.read',
    'media.upload',
    'media.manage',
    'matches.manage',
    'statistics.manage',
    'live.approve',
    'hall-of-fame.manage',
    'museum.manage',
    'analytics.read',
    'players.manage',
    'clubs.manage',
    'competitions.manage',
    'ticketing.manage',
    'membership.manage',
    'live.manage',
  ],
  Writer: [
    'news.manage',
    'news.submit',
    'gallery.manage',
    'media.read',
    'media.upload',
  ],
  Komentator: ['live.manage', 'matches.manage'],
  Redar: ['admissions.scan'],
  Član: [],
};
