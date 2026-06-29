import * as bcrypt from 'bcrypt';
import { SETTINGS_REGISTRY, settingDefToCreate } from '../../src/settings/settings.registry';
import type { SeedPrisma } from './prisma-client';

const DEMO_SETTINGS: Record<string, string> = {
  'contact.phone': '+387 33 000 000',
  'contact.address': 'Gračanica, Bosna i Hercegovina',
  'seo.description': 'Službena web stranica FK Gračanica — vijesti, utakmice, članstvo i ulaznice.',
};

export async function seedSettingsAndAdmin(prisma: SeedPrisma): Promise<string | null> {
  for (const setting of SETTINGS_REGISTRY) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      create: settingDefToCreate(setting),
      update: {},
    });
  }

  for (const [key, value] of Object.entries(DEMO_SETTINGS)) {
    const existing = await prisma.setting.findUnique({ where: { key } });
    if (existing && !existing.value.trim()) {
      await prisma.setting.update({ where: { key }, data: { value } });
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@fkgracanica.ba';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'change-me';
  const adminRole = await prisma.role.findUnique({ where: { name: 'Administrator' } });
  if (!adminRole) return null;

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

  return admin.id;
}
