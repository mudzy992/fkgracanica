import { BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export async function ensureNotLastAdmin(
  prisma: PrismaService,
  userId: string,
) {
  const adminRole = await prisma.role.findUnique({
    where: { name: 'Administrator' },
  });
  if (!adminRole) return;
  const isAdmin = await prisma.userRole.findFirst({
    where: { userId, roleId: adminRole.id },
  });
  if (!isAdmin) return;
  const adminCount = await prisma.userRole.count({
    where: {
      roleId: adminRole.id,
      user: { deletedAt: null, isActive: true },
    },
  });
  if (adminCount <= 1) {
    throw new BadRequestException(
      'Ne možete ukloniti posljednjeg administratora',
    );
  }
}

export function ensureNotSelf(
  actorId: string,
  targetId: string,
  message: string,
) {
  if (actorId === targetId) throw new BadRequestException(message);
}

export function ensureNotSelfDeactivate(
  actorId: string,
  targetId: string,
  isActive?: boolean,
) {
  if (actorId === targetId && isActive === false) {
    throw new BadRequestException('Ne možete deaktivirati vlastiti račun');
  }
}

export function ensureNotSelfAdminRemoval(
  actorId: string,
  targetId: string,
  hadAdmin: boolean,
  willHaveAdmin: boolean,
) {
  if (actorId === targetId && hadAdmin && !willHaveAdmin) {
    throw new BadRequestException(
      'Ne možete sami sebi ukloniti administratorsku ulogu',
    );
  }
}

/** BE-09/P-B09-2: duplikat emaila pri izmjeni = 409 (prije: P2002 → 500). */
export async function assertEmailAvailable(
  prisma: PrismaService,
  email: string,
  userId: string,
): Promise<void> {
  const clash = await prisma.user.findUnique({ where: { email } });
  if (clash && clash.id !== userId) {
    throw new ConflictException('Email već postoji');
  }
}

/** BE-09/P-B09-2: nepoznata uloga u `roleIds` = 400 (prije: FK greška → 500). */
export async function assertRoleIdsExist(
  prisma: PrismaService,
  roleIds: string[],
): Promise<void> {
  const unique = [...new Set(roleIds)];
  const found = await prisma.role.findMany({
    where: { id: { in: unique } },
    select: { id: true },
  });
  if (found.length !== unique.length) {
    throw new BadRequestException('Nepoznata uloga u listi');
  }
}
