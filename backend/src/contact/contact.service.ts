import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { name: string; email: string; subject?: string; message: string; userId?: string }) {
    return this.prisma.contactMessage.create({ data });
  }

  findAll() {
    return this.prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  }

  markRead(id: string) {
    return this.prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
  }
}
