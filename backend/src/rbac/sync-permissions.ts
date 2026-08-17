import { PERMISSIONS } from '../common/constants/permissions';
import type { PrismaService } from '../prisma/prisma.service';

/** Upsert permission keys and grant any missing ones to Administrator. */
export async function syncPermissions(prisma: PrismaService) {
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      create: perm,
      update: { description: perm.description },
    });
  }
  const admin = await prisma.role.findUnique({ where: { name: 'Administrator' } });
  if (!admin) return;
  const all = await prisma.permission.findMany();
  const existing = await prisma.rolePermission.findMany({ where: { roleId: admin.id } });
  const have = new Set(existing.map((row) => row.permissionId));
  const missing = all.filter((p) => !have.has(p.id));
  if (!missing.length) return;
  await prisma.rolePermission.createMany({
    data: missing.map((p) => ({ roleId: admin.id, permissionId: p.id })),
  });
}
