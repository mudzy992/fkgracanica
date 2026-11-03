import * as bcrypt from 'bcrypt';
import { SETTINGS_REGISTRY, settingDefToCreate } from '../../src/settings/settings.registry';
import type { SeedPrisma } from './prisma-client';

/**
 * BE-09c/P-B09c-1: lozinka admina se NIKAD ne izmišlja i ne resetuje slučajno.
 * - prvi seed: `ADMIN_PASSWORD` je OBAVEZAN (nema `change-me` fallbacka),
 * - postojeći admin: hash se NE prepisuje (prije se lozinka resetovala na
 *   svakom pokretanju seederа i gasila promjenu kroz aplikaciju),
 * - namjerni reset: `ADMIN_RESET_PASSWORD=1` (uz `ADMIN_PASSWORD`).
 */
function resolveAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    throw new Error(
      'ADMIN_PASSWORD nije postavljen — seed odbija kreirati admina sa ' +
        'default lozinkom (postavi ADMIN_PASSWORD u .env ili produkcijskom env-u).',
    );
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD mora imati najmanje 8 znakova.');
  }
  if (process.env.NODE_ENV === 'production' && /^change[-_]?me$/i.test(password)) {
    throw new Error('ADMIN_PASSWORD ne smije biti "change-me" u produkciji.');
  }
  return password;
}

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
  const adminRole = await prisma.role.findUnique({
    where: { name: 'Administrator' },
  });
  if (!adminRole) return null;

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  const resetPassword = process.env.ADMIN_RESET_PASSWORD === '1';
  // Lozinka se traži SAMO kad je zaista potrebna (kreiranje ili eksplicitan reset).
  const passwordHash =
    !existing || resetPassword
      ? await bcrypt.hash(resolveAdminPassword(), 10)
      : undefined;

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: passwordHash as string,
      firstName: 'Admin',
      lastName: 'FK Gračanica',
      roles: { create: [{ roleId: adminRole.id }] },
    },
    update: {
      // BE-09c/P-B09c-1: bez reset flaga se NE dira postojeća lozinka.
      ...(passwordHash ? { passwordHash } : {}),
      isActive: true,
      deletedAt: null,
    },
  });

  const hasRole = await prisma.userRole.findUnique({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
  });
  if (!hasRole) {
    await prisma.userRole.create({ data: { userId: admin.id, roleId: adminRole.id } });
  }

  return admin.id;
}
