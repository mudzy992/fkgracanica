import {
  BadRequestException,
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
    type ExistingItem = {
      id: string;
      label: string;
      isSystem: boolean;
      parentId: string | null;
    };
    const rows = existing as ExistingItem[];
    const systemItems = rows.filter((e) => e.isSystem);
    const payloadIds = new Set(items.map((i) => i.id).filter(Boolean));
    const existingById = new Map<string, ExistingItem>(
      rows.map((e) => [e.id, e] as const),
    );

    for (const sys of systemItems) {
      if (!payloadIds.has(sys.id)) {
        throw new ForbiddenException(
          `Sistemska stavka "${sys.label}" ne može biti uklonjena`,
        );
      }
    }

    // BE-09b/P-B09b-2: ID koji ne pripada ovom meniju se odbija (prije se
    // tiho ignorisao i pravio duplikat stavke iz "stale" admin sesije).
    for (const item of items) {
      if (item.id && !existingById.has(item.id)) {
        throw new BadRequestException(
          `Stavka menija "${item.id}" ne pripada ovom meniju`,
        );
      }
    }

    this.assertValidParents(items, existingById);

    const customExisting = rows.filter((e) => !e.isSystem);
    const toDelete = customExisting
      .filter((e) => !payloadIds.has(e.id))
      .map((e) => e.id);

    // BE-09b/P-B09b-2: brisanje + svi upisi u JEDNOJ transakciji — prije je
    // pad bilo kojeg koraka ostavljao poluspremljen meni.
    await this.prisma.$transaction(async (tx) => {
      if (toDelete.length) {
        await tx.cmsMenuItem.deleteMany({
          where: { id: { in: toDelete }, isSystem: false },
        });
      }

      for (const item of items) {
        const prev = item.id ? existingById.get(item.id) : undefined;
        if (prev?.isSystem) {
          await tx.cmsMenuItem.update({
            where: { id: prev.id },
            data: { sortOrder: item.sortOrder, enabled: item.enabled ?? true },
          });
          continue;
        }
        const data = {
          label: item.label,
          sortOrder: item.sortOrder,
          pageId: item.pageId ?? null,
          path: item.path ?? null,
          externalUrl: item.externalUrl ?? null,
          parentId: item.parentId ?? null,
          enabled: item.enabled ?? true,
        };
        if (prev) {
          await tx.cmsMenuItem.update({ where: { id: prev.id }, data });
          continue;
        }
        await tx.cmsMenuItem.create({
          data: { menuId: menu.id, ...data, isSystem: false },
        });
      }
    });

    return this.findByKey(key);
  }

  /**
   * BE-09b/P-B09b-2: `parentId` mora pokazivati na stavku ISTOG menija, ne na
   * sebe i ne u ciklus (prije: self-reference/ciklus/nepostojeći roditelj su
   * prolazili, `P2003` je davao 500 ili je meni bio pokvaren).
   */
  private assertValidParents(
    items: MenuItemInput[],
    existingById: Map<string, { parentId: string | null }>,
  ) {
    const newParent = new Map<string, string>();
    for (const item of items) {
      const parentId = item.parentId ?? null;
      if (!parentId) continue;
      if (item.id && parentId === item.id) {
        throw new BadRequestException(
          'Stavka menija ne može biti sama sebi roditelj',
        );
      }
      if (!existingById.has(parentId)) {
        throw new BadRequestException(
          `Roditeljska stavka "${parentId}" ne postoji u ovom meniju`,
        );
      }
      if (item.id) newParent.set(item.id, parentId);
    }

    const parentOf = (id: string): string | null =>
      newParent.get(id) ?? existingById.get(id)?.parentId ?? null;

    for (const id of newParent.keys()) {
      const seen = new Set<string>([id]);
      let current = parentOf(id);
      while (current) {
        if (seen.has(current)) {
          throw new BadRequestException('Kružna struktura u meniju');
        }
        seen.add(current);
        current = parentOf(current);
      }
    }
  }
}
