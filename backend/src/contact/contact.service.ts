import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ContactListQueryDto } from './dto/contact-list-query.dto';
import { paginate, parsePagination } from '../common/utils/pagination.util';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { name: string; email: string; subject?: string; message: string; userId?: string }) {
    return this.prisma.contactMessage.create({ data });
  }

  async findAll(query: ContactListQueryDto) {
    const params = parsePagination(query);
    const where: Prisma.ContactMessageWhereInput = {};
    if (query.unreadOnly) where.isRead = false;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { subject: { contains: params.search } },
        { message: { contains: params.search } },
      ];
    }
    return paginate(
      params,
      (skip, take) =>
        this.prisma.contactMessage.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
      () => this.prisma.contactMessage.count({ where }),
    );
  }

  async findOne(id: string) {
    const item = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Poruka nije pronađena');
    return item;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contactMessage.delete({ where: { id } });
  }

  markRead(id: string) {
    return this.prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
  }

  markAllRead() {
    return this.prisma.contactMessage.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  }
}
