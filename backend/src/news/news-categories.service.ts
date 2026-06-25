import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slug.util';

@Injectable()
export class NewsCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.newsCategory.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.newsCategory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Kategorija nije pronađena');
    return item;
  }

  async create(data: { name: string; slug?: string }) {
    const slug = data.slug?.trim() || slugify(data.name);
    return this.prisma.newsCategory.create({ data: { name: data.name, slug } });
  }

  async update(id: string, data: { name?: string; slug?: string }) {
    await this.findOne(id);
    return this.prisma.newsCategory.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.newsCategory.delete({ where: { id } });
  }
}
