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

  /** BE-09b/P-B09b-9: 404 umjesto Prisma P2025 (500) na nepostojeći ID. */
  private async ensure(id: string) {
    const item = await this.prisma.gallery.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Galerija nije pronađena');
    return item;
  }

  async create(data: { title: string; description?: string }) {
    const slug = await this.uniqueSlug(slugify(data.title));
    return this.prisma.gallery.create({
      data: { ...data, slug, status: ContentStatus.DRAFT },
    });
  }

  /**
   * BE-09b/P-B09b-1: allowlist — `status`, `slug`, `createdAt` i `id` se ne
   * mogu mijenjati kroz `PATCH /gallery/:id` (status ide kroz `/:id/status`
   * uz dozvolu `gallery.approve`). Prije je `{ ...data }` išao pravo u Prisma.
   */
  async update(
    id: string,
    data: { title?: string; description?: string | null },
  ) {
    await this.ensure(id);
    const update: {
      title?: string;
      description?: string | null;
      slug?: string;
    } = {};
    if (data.title !== undefined) {
      update.title = data.title;
      update.slug = await this.uniqueSlug(slugify(data.title), id);
    }
    if (data.description !== undefined) update.description = data.description;
    if (!Object.keys(update).length) return this.ensure(id);
    return this.prisma.gallery.update({ where: { id }, data: update });
  }

  async updateStatus(id: string, status: ContentStatus) {
    await this.ensure(id);
    return this.prisma.gallery.update({ where: { id }, data: { status } });
  }

  async addPhoto(
    galleryId: string,
    data: { path: string; caption?: string; sortOrder?: number },
  ) {
    await this.ensure(galleryId);
    const sortOrder =
      data.sortOrder ??
      ((
        await this.prisma.galleryPhoto.aggregate({
          where: { galleryId },
          _max: { sortOrder: true },
        })
      )._max.sortOrder ?? -1) + 1;
    return this.prisma.galleryPhoto.create({
      data: { ...data, sortOrder, galleryId },
    });
  }

  /** BE-09b/P-B09b-9: fotografija mora pripadati galeriji iz putanje. */
  async removePhoto(galleryId: string, photoId: string) {
    const photo = await this.prisma.galleryPhoto.findUnique({
      where: { id: photoId },
    });
    if (!photo || photo.galleryId !== galleryId) {
      throw new NotFoundException('Fotografija nije pronađena');
    }
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

  async remove(id: string) {
    await this.ensure(id);
    return this.prisma.gallery.delete({ where: { id } });
  }

  private async uniqueSlug(base: string, excludeId?: string) {
    let slug = base;
    let n = 2;
    for (;;) {
      const existing = await this.prisma.gallery.findUnique({
        where: { slug },
      });
      if (!existing || existing.id === excludeId) return slug;
      slug = `${base}-${n++}`;
    }
  }
}
