import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { validateWidgetConfig } from './widgets/schemas';

const pageInclude = { sections: { orderBy: { sortOrder: 'asc' as const } } };

@Injectable()
export class CmsPagesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(admin = false) {
    return this.prisma.cmsPage.findMany({
      where: admin ? undefined : { status: ContentStatus.PUBLISHED },
      orderBy: { title: 'asc' },
      include: admin ? pageInclude : undefined,
    });
  }

  async findBySlug(slug: string, admin = false) {
    const page = await this.prisma.cmsPage.findUnique({ where: { slug }, include: pageInclude });
    if (!page) throw new NotFoundException('Stranica nije pronađena');
    if (!admin && page.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Stranica nije objavljena');
    }
    return {
      ...page,
      sections: page.sections.filter((s) => admin || s.enabled),
    };
  }

  create(data: Prisma.CmsPageCreateInput) {
    return this.prisma.cmsPage.create({ data, include: pageInclude });
  }

  async update(id: string, data: Prisma.CmsPageUpdateInput) {
    await this.ensurePage(id);
    return this.prisma.cmsPage.update({ where: { id }, data, include: pageInclude });
  }

  async remove(id: string) {
    const page = await this.ensurePage(id);
    if (page.isSystem) throw new ForbiddenException('Sistemska stranica se ne može obrisati');
    if (page.status !== ContentStatus.DRAFT) {
      throw new ForbiddenException('Samo stranice u statusu Nacrt mogu biti obrisane');
    }
    return this.prisma.cmsPage.delete({ where: { id } });
  }

  async addSection(pageId: string, body: { widgetType: string; config?: object; enabled?: boolean }) {
    await this.ensurePage(pageId);
    const validated = validateWidgetConfig(body.widgetType, body.config ?? {});
    if (!validated.ok) throw new ForbiddenException(validated.error);
    const max = await this.prisma.cmsPageSection.aggregate({
      where: { pageId },
      _max: { sortOrder: true },
    });
    return this.prisma.cmsPageSection.create({
      data: {
        pageId,
        widgetType: body.widgetType,
        config: validated.data as Prisma.InputJsonValue,
        sortOrder: (max._max.sortOrder ?? -1) + 1,
        enabled: body.enabled ?? true,
      },
    });
  }

  async updateSection(pageId: string, sectionId: string, body: Record<string, unknown>) {
    const section = await this.ensureSection(pageId, sectionId);
    const widgetType = (body.widgetType as string) ?? section.widgetType;
    const config = body.config !== undefined ? body.config : section.config;
    const validated = validateWidgetConfig(widgetType, config);
    if (!validated.ok) throw new ForbiddenException(validated.error);
    return this.prisma.cmsPageSection.update({
      where: { id: sectionId },
      data: {
        widgetType,
        config: validated.data as Prisma.InputJsonValue,
        ...(body.enabled !== undefined ? { enabled: Boolean(body.enabled) } : {}),
      },
    });
  }

  async removeSection(pageId: string, sectionId: string) {
    await this.ensureSection(pageId, sectionId);
    return this.prisma.cmsPageSection.delete({ where: { id: sectionId } });
  }

  async reorderSections(pageId: string, ids: string[]) {
    await this.ensurePage(pageId);
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.cmsPageSection.update({ where: { id }, data: { sortOrder: index } }),
      ),
    );
    return this.prisma.cmsPageSection.findMany({ where: { pageId }, orderBy: { sortOrder: 'asc' } });
  }

  private async ensurePage(id: string) {
    const page = await this.prisma.cmsPage.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Stranica nije pronađena');
    return page;
  }

  private async ensureSection(pageId: string, sectionId: string) {
    const section = await this.prisma.cmsPageSection.findFirst({ where: { id: sectionId, pageId } });
    if (!section) throw new NotFoundException('Sekcija nije pronađena');
    return section;
  }
}
