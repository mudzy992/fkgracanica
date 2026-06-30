import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export async function ensureNotLastAdmin(prisma: PrismaService, userId: string) {
  const adminRole = await prisma.role.findUnique({ where: { name: 'Administrator' } });
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
    throw new BadRequestException('Ne možete ukloniti posljednjeg administratora');
  }
}

export function ensureNotSelf(actorId: string, targetId: string, message: string) {
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
    throw new BadRequestException('Ne možete sami sebi ukloniti administratorsku ulogu');
  }
}
