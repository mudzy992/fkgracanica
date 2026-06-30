import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PaginatedQueryDto } from '../common/dto/paginated-query.dto';
import { paginate, parsePagination } from '../common/utils/pagination.util';
import {
  ensureNotLastAdmin,
  ensureNotSelf,
  ensureNotSelfAdminRemoval,
  ensureNotSelfDeactivate,
} from './users-security.util';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: PaginatedQueryDto) {
    const params = parsePagination(query);
    const where = {
      deletedAt: null,
      ...(params.search
        ? {
            OR: [
              { email: { contains: params.search } },
              { firstName: { contains: params.search } },
              { lastName: { contains: params.search } },
            ],
          }
        : {}),
    };
    return paginate(
      params,
      (skip, take) =>
        this.prisma.user.findMany({
          where,
          skip,
          take,
          select: this.userSelect(),
          orderBy: { createdAt: 'desc' },
        }),
      () => this.prisma.user.count({ where }),
    );
  }

  findRoleOptions() {
    return this.prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: this.userSelect(),
    });
    if (!user) throw new NotFoundException('Korisnik nije pronađen');
    return user;
  }

  async create(actorId: string, dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email već postoji');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roles: dto.roleIds?.length
          ? { create: dto.roleIds.map((roleId) => ({ roleId })) }
          : undefined,
      },
      select: this.userSelect(),
    });
    await this.audit.log({
      actorId,
      action: 'users.create',
      entity: 'User',
      entityId: user.id,
      metadata: { email: user.email, roleIds: dto.roleIds ?? [] },
    });
    return user;
  }

  async update(actorId: string, id: string, dto: UpdateUserDto) {
    const existing = await this.findOne(id);
    ensureNotSelfDeactivate(actorId, id, dto.isActive);
    if (dto.isActive === false || (dto.roleIds && !dto.roleIds.length)) {
      await ensureNotLastAdmin(this.prisma, id);
    }
    const adminRole = await this.prisma.role.findUnique({ where: { name: 'Administrator' } });
    const hadAdmin = existing.roles?.some((r) => r.role.name === 'Administrator') ?? false;
    const willHaveAdmin = adminRole ? (dto.roleIds?.includes(adminRole.id) ?? hadAdmin) : hadAdmin;
    if (dto.roleIds) {
      ensureNotSelfAdminRemoval(actorId, id, hadAdmin, willHaveAdmin);
      if (hadAdmin && !willHaveAdmin) await ensureNotLastAdmin(this.prisma, id);
    }
    const data: Record<string, unknown> = {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      isActive: dto.isActive,
    };
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);
    if (dto.roleIds) {
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      if (dto.roleIds.length) {
        await this.prisma.userRole.createMany({
          data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
        });
      }
    }
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: this.userSelect(),
    });
    await this.audit.log({
      actorId,
      action: 'users.update',
      entity: 'User',
      entityId: id,
      metadata: { email: user.email, isActive: user.isActive, roleIds: dto.roleIds },
    });
    return user;
  }

  async remove(actorId: string, id: string) {
    ensureNotSelf(actorId, id, 'Ne možete obrisati vlastiti račun');
    await ensureNotLastAdmin(this.prisma, id);
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
      select: this.userSelect(),
    });
    await this.audit.log({
      actorId,
      action: 'users.delete',
      entity: 'User',
      entityId: id,
      metadata: { email: user.email },
    });
    return user;
  }

  private userSelect() {
    return {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      roles: { select: { role: { select: { id: true, name: true } } } },
    };
  }
}
