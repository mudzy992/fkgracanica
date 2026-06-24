import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
import { PERMISSIONS, ALL_PERMISSION_KEYS } from '../src/common/constants/permissions';
import { SETTINGS_REGISTRY } from '../src/settings/settings.registry';

function createPrisma() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set');
  const parsed = new URL(databaseUrl);
  const adapter = new PrismaMariaDb({
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
    connectionLimit: 5,
  });
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

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
  Writer: ['news.manage', 'gallery.manage'],
  Komentator: ['live.manage', 'matches.manage'],
  Član: [],
};

async function main() {
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

  for (const setting of SETTINGS_REGISTRY) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      create: setting,
      update: {},
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@fkgracanica.ba';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'change-me';
  const adminRole = await prisma.role.findUnique({ where: { name: 'Administrator' } });

  if (adminRole) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      create: {
        email: adminEmail,
        passwordHash,
        firstName: 'Admin',
        lastName: 'FK Gračanica',
        roles: { create: [{ roleId: adminRole.id }] },
      },
      update: { passwordHash, isActive: true, deletedAt: null },
    });
    const hasRole = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    });
    if (!hasRole) {
      await prisma.userRole.create({ data: { userId: admin.id, roleId: adminRole.id } });
    }
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
