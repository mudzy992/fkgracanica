import {
  ConflictException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PaginatedQueryDto } from '../common/dto/paginated-query.dto';
import { paginate, parsePagination } from '../common/utils/pagination.util';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: this.userSelect(),
    });
    if (!user) throw new NotFoundException('Korisnik nije pronađen');
    return user;
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email već postoji');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
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
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.findOne(id);
    if (dto.isActive === false || (dto.roleIds && !dto.roleIds.length)) {
      await this.ensureNotLastAdmin(id);
    }
    if (dto.roleIds) {
      const adminRole = await this.prisma.role.findUnique({ where: { name: 'Administrator' } });
      const hadAdmin = existing.roles?.some((r) => r.role.name === 'Administrator');
      const willHaveAdmin = adminRole && dto.roleIds.includes(adminRole.id);
      if (hadAdmin && !willHaveAdmin) await this.ensureNotLastAdmin(id);
    }
    const data: Record<string, unknown> = {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      isActive: dto.isActive,
    };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    if (dto.roleIds) {
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      if (dto.roleIds.length) {
        await this.prisma.userRole.createMany({
          data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
        });
      }
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: this.userSelect(),
    });
  }

  async remove(id: string) {
    await this.ensureNotLastAdmin(id);
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
      select: this.userSelect(),
    });
  }

  private async ensureNotLastAdmin(userId: string) {
    const adminRole = await this.prisma.role.findUnique({ where: { name: 'Administrator' } });
    if (!adminRole) return;
    const isAdmin = await this.prisma.userRole.findFirst({
      where: { userId, roleId: adminRole.id },
    });
    if (!isAdmin) return;
    const adminCount = await this.prisma.userRole.count({
      where: {
        roleId: adminRole.id,
        user: { deletedAt: null, isActive: true },
      },
    });
    if (adminCount <= 1) {
      throw new BadRequestException('Ne možete ukloniti posljednjeg administratora');
    }
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
      roles: {
        select: {
          role: { select: { id: true, name: true } },
        },
      },
    };
  }
}
