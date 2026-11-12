import { PERMISSIONS } from '../../src/common/constants/permissions';
import { ROLES, ROLE_PERMISSIONS } from '../../src/rbac/rbac-seed.constants';
import type { SeedPrisma } from './prisma-client';

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

  // BE-09c/P-B09c-5: nepoznat ključ u ROLE_PERMISSIONS je greška u konfiguraciji
  // — prije se tiho odbacivao (`.filter(Boolean)`), pa je rola ostajala bez
  // dozvole bez ijedne poruke.
  const unknown = [
    ...new Set(
      Object.values(ROLE_PERMISSIONS)
        .flat()
        .filter((key) => !permissionMap.has(key)),
    ),
  ];
  if (unknown.length) {
    throw new Error(
      `Nepoznate dozvole u ROLE_PERMISSIONS: ${unknown.join(', ')}`,
    );
  }

  for (const role of ROLES) {
    const dbRole = await prisma.role.upsert({
      where: { name: role.name },
      create: { name: role.name, description: role.description },
      update: { description: role.description },
    });

    const keys = ROLE_PERMISSIONS[role.name] ?? [];
    const rows = keys.map((key) => ({
      roleId: dbRole.id,
      permissionId: permissionMap.get(key) as string,
    }));

    // BE-09c/P-B09c-5: zamjena dozvola je atomska (prije: pad createMany-a je
    // ostavljao rolu bez ijedne dozvole).
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: dbRole.id } });
      if (rows.length) {
        await tx.rolePermission.createMany({ data: rows });
      }
    });
  }
}
