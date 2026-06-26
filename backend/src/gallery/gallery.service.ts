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

  async findBySlug(slug: string) {
    const item = await this.prisma.gallery.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
      include: { photos: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!item) throw new NotFoundException('Galerija nije pronađena');
    return item;
  }

  async create(data: { title: string; description?: string }) {
    const slug = await this.uniqueSlug(slugify(data.title));
    return this.prisma.gallery.create({
      data: { ...data, slug, status: ContentStatus.DRAFT },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    const update: Record<string, unknown> = { ...data };
    if (typeof data.title === 'string') {
      update.slug = await this.uniqueSlug(slugify(data.title), id);
    }
    return this.prisma.gallery.update({ where: { id }, data: update });
  }

  updateStatus(id: string, status: ContentStatus) {
    return this.prisma.gallery.update({ where: { id }, data: { status } });
  }

  async addPhoto(galleryId: string, data: { path: string; caption?: string; sortOrder?: number }) {
    const sortOrder =
      data.sortOrder ??
      ((await this.prisma.galleryPhoto.aggregate({
        where: { galleryId },
        _max: { sortOrder: true },
      }))._max.sortOrder ?? -1) + 1;
    return this.prisma.galleryPhoto.create({ data: { ...data, sortOrder, galleryId } });
  }

  removePhoto(photoId: string) {
    return this.prisma.galleryPhoto.delete({ where: { id: photoId } });
  }

  reorderPhotos(galleryId: string, photoIds: string[]) {
    return this.prisma.$transaction(
      photoIds.map((id, index) =>
        this.prisma.galleryPhoto.update({
          where: { id, galleryId },
          data: { sortOrder: index },
        }),
      ),
    );
  }

  remove(id: string) {
    return this.prisma.gallery.delete({ where: { id } });
  }

  private async uniqueSlug(base: string, excludeId?: string) {
    let slug = base;
    let n = 2;
    for (;;) {
      const existing = await this.prisma.gallery.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) return slug;
      slug = `${base}-${n++}`;
    }
  }
}
