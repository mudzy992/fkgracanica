import type { PrismaService } from '../prisma/prisma.service';

export async function applySeoSettingDefaults(
  prisma: PrismaService,
  updates: Record<string, string>,
): Promise<Record<string, string>> {
  const needsTitle = 'seo.title' in updates && !updates['seo.title']?.trim();
  const needsDesc =
    'seo.description' in updates && !updates['seo.description']?.trim();
  if (!needsTitle && !needsDesc) return updates;

  const [club, clubNameSetting] = await Promise.all([
    prisma.club.findFirst({
      where: { isOwnClub: true },
      select: { name: true, description: true },
    }),
    prisma.setting.findUnique({ where: { key: 'club.name' } }),
  ]);

  const clubName =
    club?.name?.trim() || clubNameSetting?.value?.trim() || 'FK Gračanica';
  const result = { ...updates };

  if (needsTitle) result['seo.title'] = clubName;
  if (needsDesc) {
    result['seo.description'] =
      club?.description?.trim() || `${clubName} — službena web stranica kluba.`;
  }

  return result;
}
