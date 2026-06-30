import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export const SYSTEM_ROLES = ['Administrator', 'Moderator', 'Writer', 'Komentator', 'Član'];

@Injectable()
export class RbacService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

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

  async updateRolePermissions(actorId: string, roleId: string, permissionKeys: string[]) {
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
    const updated = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } },
    });
    await this.audit.log({
      actorId,
      action: 'rbac.role.permissions.update',
      entity: 'Role',
      entityId: roleId,
      metadata: { roleName: role.name, permissionKeys },
    });
    return updated;
  }

  async createRole(actorId: string, data: { name: string; description?: string }) {
    const role = await this.prisma.role.create({ data });
    await this.audit.log({
      actorId,
      action: 'rbac.role.create',
      entity: 'Role',
      entityId: role.id,
      metadata: { name: role.name },
    });
    return role;
  }

  async deleteRole(actorId: string, roleId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Uloga nije pronađena');
    if (this.isSystemRole(role.name)) {
      throw new BadRequestException('Sistemska uloga se ne može obrisati');
    }
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    await this.prisma.userRole.deleteMany({ where: { roleId } });
    await this.prisma.role.delete({ where: { id: roleId } });
    await this.audit.log({
      actorId,
      action: 'rbac.role.delete',
      entity: 'Role',
      entityId: roleId,
      metadata: { name: role.name },
    });
    return { ok: true };
  }

  isSystemRole(name: string) {
    return SYSTEM_ROLES.includes(name);
  }
}
