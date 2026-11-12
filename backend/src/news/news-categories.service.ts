import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slug.util';

/** Prisma unique constraint violation. */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === 'P2002'
  );
}

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

  /** BE-09b/P-B09b-7: duplikat sluga je 409 (prije: P2002 → 500). */
  async create(data: { name: string; slug?: string }) {
    const slug = data.slug?.trim() || slugify(data.name);
    try {
      return await this.prisma.newsCategory.create({
        data: { name: data.name, slug },
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(`Kategorija sa slugom "${slug}" postoji`);
      }
      throw error;
    }
  }

  async update(id: string, data: { name?: string; slug?: string }) {
    await this.findOne(id);
    // BE-09b/P-B09b-7: eksplicitni slug se trimuje i validira; promjena imena
    // NE mijenja slug (stabilni URL-ovi — isto kao `news` i `gallery`).
    const update: { name?: string; slug?: string } = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.slug !== undefined) {
      const slug = data.slug.trim();
      if (!slug) throw new BadRequestException('Slug ne može biti prazan');
      update.slug = slug;
    }
    if (!Object.keys(update).length) return this.findOne(id);
    try {
      return await this.prisma.newsCategory.update({
        where: { id },
        data: update,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          `Kategorija sa slugom "${update.slug}" postoji`,
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.newsCategory.delete({ where: { id } });
  }
}
