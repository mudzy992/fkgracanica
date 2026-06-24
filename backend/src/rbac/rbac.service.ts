import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SYSTEM_ROLES = ['Administrator', 'Moderator', 'Writer', 'Komentator', 'Član'];

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  findRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  findPermissions() {
    return this.prisma.permission.findMany({ orderBy: { key: 'asc' } });
  }

  async updateRolePermissions(roleId: string, permissionKeys: string[]) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Uloga nije pronađena');
    if (role.name === 'Administrator') {
      throw new BadRequestException('Dozvole administratora se ne mogu mijenjati');
    }

    const permissions = await this.prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
    });
    if (permissions.length !== permissionKeys.length) {
      throw new BadRequestException('Nepoznata dozvola u listi');
    }

    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    if (permissions.length) {
      await this.prisma.rolePermission.createMany({
        data: permissions.map((p) => ({ roleId, permissionId: p.id })),
      });
    }
    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } },
    });
  }

  isSystemRole(name: string) {
    return SYSTEM_ROLES.includes(name);
  }
}
