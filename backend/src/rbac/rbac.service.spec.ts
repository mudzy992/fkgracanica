import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { AuditService } from '../audit/audit.service';
import type { PrismaService } from '../prisma/prisma.service';
import { RbacService } from './rbac.service';

type Mock = jest.Mock;

interface MockPrisma {
  role: { findUnique: Mock; create: Mock; delete: Mock };
  permission: { findMany: Mock };
  rolePermission: { deleteMany: Mock; createMany: Mock };
  userRole: { deleteMany: Mock };
  $transaction: Mock & ((arg: unknown) => Promise<unknown>);
}

function makePrisma(): MockPrisma {
  const prisma: MockPrisma = {
    role: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    permission: { findMany: jest.fn().mockResolvedValue([]) },
    rolePermission: { deleteMany: jest.fn(), createMany: jest.fn() },
    userRole: { deleteMany: jest.fn() },
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === 'function'
      ? (arg as (tx: unknown) => Promise<unknown>)(prisma)
      : Promise.all(arg as Promise<unknown>[]),
  );
  return prisma;
}

function service(prisma: MockPrisma) {
  const audit = { log: jest.fn().mockResolvedValue(undefined) };
  return {
    svc: new RbacService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditService,
    ),
    audit,
  };
}

describe('RbacService (BE-09 / P-B09-1, P-B09-8)', () => {
  it('updateRolePermissions mijenja dozvole unutar $transaction', async () => {
    const prisma = makePrisma();
    const { svc, audit } = service(prisma);
    prisma.role.findUnique.mockResolvedValue({ id: 'r1', name: 'Writer' });
    prisma.permission.findMany.mockResolvedValue([
      { id: 'p1', key: 'news.manage' },
    ]);

    await svc.updateRolePermissions('actor', 'r1', ['news.manage']);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.rolePermission.deleteMany).toHaveBeenCalledWith({
      where: { roleId: 'r1' },
    });
    expect(prisma.rolePermission.createMany).toHaveBeenCalledWith({
      data: [{ roleId: 'r1', permissionId: 'p1' }],
    });
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'rbac.role.permissions.update' }),
    );
  });

  it('updateRolePermissions odbija nepoznatu ulogu', async () => {
    const prisma = makePrisma();
    prisma.role.findUnique.mockResolvedValue(null);
    const { svc } = service(prisma);
    await expect(
      svc.updateRolePermissions('actor', 'nema', []),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updateRolePermissions ne dira Administratora', async () => {
    const prisma = makePrisma();
    prisma.role.findUnique.mockResolvedValue({
      id: 'r1',
      name: 'Administrator',
    });
    const { svc } = service(prisma);
    await expect(
      svc.updateRolePermissions('actor', 'r1', ['users.read']),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updateRolePermissions odbija nepoznat ključ dozvole', async () => {
    const prisma = makePrisma();
    prisma.role.findUnique.mockResolvedValue({ id: 'r1', name: 'Writer' });
    prisma.permission.findMany.mockResolvedValue([]);
    const { svc } = service(prisma);
    await expect(
      svc.updateRolePermissions('actor', 'r1', ['nepostojeca.dozvola']),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updateRolePermissions sa praznom listom briše sve dozvole', async () => {
    const prisma = makePrisma();
    prisma.role.findUnique.mockResolvedValue({ id: 'r1', name: 'Writer' });
    const { svc } = service(prisma);

    await svc.updateRolePermissions('actor', 'r1', []);

    expect(prisma.rolePermission.deleteMany).toHaveBeenCalled();
    expect(prisma.rolePermission.createMany).not.toHaveBeenCalled();
  });

  it('createRole trimuje ime i upisuje audit', async () => {
    const prisma = makePrisma();
    const { svc, audit } = service(prisma);
    prisma.role.findUnique.mockResolvedValue(null);
    prisma.role.create.mockResolvedValue({ id: 'r9', name: 'Statisticar' });

    await svc.createRole('actor', { name: '  Statisticar ' });

    expect(prisma.role.create).toHaveBeenCalledWith({
      data: { name: 'Statisticar' },
    });
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'rbac.role.create', entityId: 'r9' }),
    );
  });

  it('createRole vraća 409 na duplikat imena (prije: 500)', async () => {
    const prisma = makePrisma();
    prisma.role.findUnique.mockResolvedValue({ id: 'r1' });
    const { svc } = service(prisma);
    await expect(
      svc.createRole('actor', { name: 'Writer' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.role.create).not.toHaveBeenCalled();
  });

  it('deleteRole briše sve u jednoj transakciji', async () => {
    const prisma = makePrisma();
    const { svc, audit } = service(prisma);
    prisma.role.findUnique.mockResolvedValue({ id: 'r1', name: 'Custom' });

    await svc.deleteRole('actor', 'r1');

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.rolePermission.deleteMany).toHaveBeenCalledWith({
      where: { roleId: 'r1' },
    });
    expect(prisma.userRole.deleteMany).toHaveBeenCalledWith({
      where: { roleId: 'r1' },
    });
    expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'rbac.role.delete' }),
    );
  });

  it('deleteRole ne briše sistemsku ulogu', async () => {
    const prisma = makePrisma();
    prisma.role.findUnique.mockResolvedValue({ id: 'r1', name: 'Redar' });
    const { svc } = service(prisma);
    await expect(svc.deleteRole('actor', 'r1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.role.delete).not.toHaveBeenCalled();
  });

  it('deleteRole odbija nepostojeću ulogu', async () => {
    const prisma = makePrisma();
    prisma.role.findUnique.mockResolvedValue(null);
    const { svc } = service(prisma);
    await expect(svc.deleteRole('actor', 'x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('isSystemRole prepoznaje sistemske role', () => {
    const { svc } = service(makePrisma());
    expect(svc.isSystemRole('Administrator')).toBe(true);
    expect(svc.isSystemRole('Član')).toBe(true);
    expect(svc.isSystemRole('Custom')).toBe(false);
  });
});
