import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.cmsBlock.findMany({ orderBy: { key: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.cmsBlock.findUnique({ where: { id } });
  }

  findByKey(key: string) {
    return this.prisma.cmsBlock.findUnique({ where: { key } });
  }

  create(data: Prisma.CmsBlockCreateInput) {
    return this.prisma.cmsBlock.create({ data });
  }

  async update(id: string, data: Prisma.CmsBlockUpdateInput) {
    await this.ensureExists(id);
    return this.prisma.cmsBlock.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.cmsBlock.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const block = await this.prisma.cmsBlock.findUnique({ where: { id } });
    if (!block) throw new NotFoundException('CMS blok nije pronađen');
  }
}
