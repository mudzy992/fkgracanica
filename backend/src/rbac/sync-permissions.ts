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
  if (admin) {
    const all = await prisma.permission.findMany();
    const existing = await prisma.rolePermission.findMany({ where: { roleId: admin.id } });
    const have = new Set(existing.map((row) => row.permissionId));
    const missing = all.filter((p) => !have.has(p.id));
    if (missing.length) {
      await prisma.rolePermission.createMany({
        data: missing.map((p) => ({ roleId: admin.id, permissionId: p.id })),
      });
    }
  }
  await ensureRedarRole(prisma);
}

async function ensureRedarRole(prisma: PrismaService) {
  const redar = await prisma.role.upsert({
    where: { name: 'Redar' },
    create: { name: 'Redar', description: 'Ulaz — skeniranje ulaznica i članskih kartica' },
    update: { description: 'Ulaz — skeniranje ulaznica i članskih kartica' },
  });
  const scan = await prisma.permission.findUnique({ where: { key: 'admissions.scan' } });
  if (!scan) return;
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: redar.id, permissionId: scan.id } },
    create: { roleId: redar.id, permissionId: scan.id },
    update: {},
  });
}
