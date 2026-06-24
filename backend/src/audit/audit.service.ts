import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditFilterDto } from './dto/audit-filter.dto';
import { paginate, parsePagination } from '../common/utils/pagination.util';

export interface AuditLogInput {
  actorId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogInput) {
    return this.prisma.auditLog.create({ data: input });
  }

  async findAll(query: AuditFilterDto) {
    const params = parsePagination(query);
    const where: Prisma.AuditLogWhereInput = {};
    if (query.action) where.action = query.action;
    if (query.actorId) where.actorId = query.actorId;
    if (query.entity) where.entity = query.entity;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }
    return paginate(
      params,
      (skip, take) =>
        this.prisma.auditLog.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: { actor: { select: { id: true, email: true } } },
        }),
      () => this.prisma.auditLog.count({ where }),
    );
  }
}
