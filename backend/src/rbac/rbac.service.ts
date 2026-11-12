import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { syncPermissions } from './sync-permissions';

export const SYSTEM_ROLES = [
  'Administrator',
  'Moderator',
  'Writer',
  'Komentator',
  'Redar',
  'Član',
];

@Injectable()
export class RbacService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  onModuleInit() {
    return syncPermissions(this.prisma);
  }

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

  async updateRolePermissions(
    actorId: string,
    roleId: string,
    permissionKeys: string[],
  ) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Uloga nije pronađena');
    if (role.name === 'Administrator') {
      throw new BadRequestException(
        'Dozvole administratora se ne mogu mijenjati',
      );
    }

    const permissions = await this.prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
    });
    if (permissions.length !== permissionKeys.length) {
      throw new BadRequestException('Nepoznata dozvola u listi');
    }

    // BE-09/P-B09-1: zamjena dozvola u JEDNOJ transakciji — prije je pad
    // `createMany`-a ostavljao ulogu bez ijedne dozvole.
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } });
      if (permissions.length) {
        await tx.rolePermission.createMany({
          data: permissions.map((p) => ({ roleId, permissionId: p.id })),
        });
      }
      return tx.role.findUnique({
        where: { id: roleId },
        include: { permissions: { include: { permission: true } } },
      });
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

  async createRole(
    actorId: string,
    data: { name: string; description?: string },
  ) {
    // BE-09/P-B09-1: duplikat imena = 409 (prije: P2002 → 500).
    const name = data.name.trim();
    const clash = await this.prisma.role.findUnique({ where: { name } });
    if (clash) throw new ConflictException('Uloga s tim imenom već postoji');
    const role = await this.prisma.role.create({
      data: { ...data, name },
    });
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
    // BE-09/P-B09-1: tri brisanja atomarno (prije: djelimično obrisana uloga).
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.userRole.deleteMany({ where: { roleId } }),
      this.prisma.role.delete({ where: { id: roleId } }),
    ]);
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
