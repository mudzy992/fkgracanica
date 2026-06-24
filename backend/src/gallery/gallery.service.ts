import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slug.util';

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: ContentStatus) {
    return this.prisma.gallery.findMany({
      where: status ? { status } : undefined,
      include: { photos: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.gallery.findUnique({
      where: { id },
      include: { photos: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!item) throw new NotFoundException('Galerija nije pronađena');
    return item;
  }

  create(data: { title: string; description?: string }) {
    return this.prisma.gallery.create({
      data: { ...data, slug: slugify(data.title), status: ContentStatus.DRAFT },
    });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.gallery.update({ where: { id }, data });
  }

  updateStatus(id: string, status: ContentStatus) {
    return this.prisma.gallery.update({ where: { id }, data: { status } });
  }

  addPhoto(galleryId: string, data: { path: string; caption?: string; sortOrder?: number }) {
    return this.prisma.galleryPhoto.create({ data: { ...data, galleryId } });
  }

  remove(id: string) {
    return this.prisma.gallery.delete({ where: { id } });
  }
}
