import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type MenuItemInput = {
  id?: string;
  label: string;
  sortOrder: number;
  pageId?: string | null;
  path?: string | null;
  externalUrl?: string | null;
  parentId?: string | null;
  enabled?: boolean;
};

@Injectable()
export class CmsMenusService {
  constructor(private readonly prisma: PrismaService) {}

  async findByKey(key: string) {
    const menu = await this.prisma.cmsMenu.findUnique({
      where: { key },
      include: {
        items: {
          where: { parentId: null },
          orderBy: { sortOrder: 'asc' },
          include: { children: { orderBy: { sortOrder: 'asc' } }, page: true },
        },
      },
    });
    if (!menu) throw new NotFoundException('Meni nije pronađen');
    return menu;
  }

  async saveItems(key: string, items: MenuItemInput[]) {
    const menu = await this.prisma.cmsMenu.findUnique({ where: { key } });
    if (!menu) throw new NotFoundException('Meni nije pronađen');

    const existing = await this.prisma.cmsMenuItem.findMany({
      where: { menuId: menu.id },
    });
    const systemItems = existing.filter((e) => e.isSystem);
    const payloadIds = new Set(items.map((i) => i.id).filter(Boolean));

    for (const sys of systemItems) {
      if (!payloadIds.has(sys.id)) {
        throw new ForbiddenException(
          `Sistemska stavka "${sys.label}" ne može biti uklonjena`,
        );
      }
    }

    const customExisting = existing.filter((e) => !e.isSystem);
    const toDelete = customExisting
      .filter((e) => !payloadIds.has(e.id))
      .map((e) => e.id);
    if (toDelete.length) {
      await this.prisma.cmsMenuItem.deleteMany({
        where: { id: { in: toDelete }, isSystem: false },
      });
    }

    for (const item of items) {
      const prev = item.id ? existing.find((e) => e.id === item.id) : undefined;
      if (prev?.isSystem) {
        await this.prisma.cmsMenuItem.update({
          where: { id: prev.id },
          data: { sortOrder: item.sortOrder, enabled: item.enabled ?? true },
        });
        continue;
      }
      if (prev) {
        await this.prisma.cmsMenuItem.update({
          where: { id: prev.id },
          data: {
            label: item.label,
            sortOrder: item.sortOrder,
            pageId: item.pageId ?? null,
            path: item.path ?? null,
            externalUrl: item.externalUrl ?? null,
            parentId: item.parentId ?? null,
            enabled: item.enabled ?? true,
          },
        });
        continue;
      }
      await this.prisma.cmsMenuItem.create({
        data: {
          menuId: menu.id,
          label: item.label,
          sortOrder: item.sortOrder,
          pageId: item.pageId ?? null,
          path: item.path ?? null,
          externalUrl: item.externalUrl ?? null,
          parentId: item.parentId ?? null,
          enabled: item.enabled ?? true,
          isSystem: false,
        },
      });
    }

    return this.findByKey(key);
  }
}
