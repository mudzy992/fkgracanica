import { PERMISSIONS, ALL_PERMISSION_KEYS } from '../../src/common/constants/permissions';
import type { SeedPrisma } from './prisma-client';

const ROLES = [
  { name: 'Administrator', description: 'Potpuna kontrola nad sistemom' },
  { name: 'Moderator', description: 'Upravljanje sadržajem i odobravanje' },
  { name: 'Writer', description: 'Kreiranje sadržaja' },
  { name: 'Komentator', description: 'Vođenje live utakmica' },
  { name: 'Član', description: 'Član kluba' },
] as const;

const ROLE_PERMISSIONS: Record<string, string[]> = {
  Administrator: ALL_PERMISSION_KEYS,
  Moderator: [
    'dashboard.read', 'news.manage', 'news.approve', 'gallery.manage', 'gallery.approve',
    'sponsors.manage', 'trophies.manage', 'club-timeline.manage', 'contact.read',
    'newsletter.read', 'cms.manage', 'media.manage', 'matches.manage', 'statistics.manage',
    'live.approve', 'hall-of-fame.manage', 'museum.manage', 'analytics.read',
    'players.manage', 'clubs.manage', 'competitions.manage', 'ticketing.manage', 'membership.manage',
  ],
  Writer: ['news.manage', 'news.submit', 'gallery.manage'],
  Komentator: ['live.manage', 'matches.manage'],
  Član: [],
};

export async function seedRbac(prisma: SeedPrisma) {
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      create: perm,
      update: { description: perm.description },
    });
  }

  const permissionMap = new Map(
    (await prisma.permission.findMany()).map((p) => [p.key, p.id]),
  );

  for (const role of ROLES) {
    const dbRole = await prisma.role.upsert({
      where: { name: role.name },
      create: { name: role.name, description: role.description },
      update: { description: role.description },
    });

    const keys = ROLE_PERMISSIONS[role.name] ?? [];
    await prisma.rolePermission.deleteMany({ where: { roleId: dbRole.id } });
    if (keys.length) {
      await prisma.rolePermission.createMany({
        data: keys
          .map((key) => permissionMap.get(key))
          .filter((id): id is string => !!id)
          .map((permissionId) => ({ roleId: dbRole.id, permissionId })),
      });
    }
  }
}
