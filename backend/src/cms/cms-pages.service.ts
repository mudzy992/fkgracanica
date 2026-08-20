import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { validateWidgetConfig } from './widgets/schemas';
import { cmsSeoDescFromSections } from './cms-seo.util';

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

  async create(data: Prisma.CmsPageCreateInput) {
    const page = await this.prisma.cmsPage.create({ data, include: pageInclude });
    return this.maybeFillSeoDesc(page.id, page.seoDesc, page.sections);
  }

  async update(id: string, data: Prisma.CmsPageUpdateInput) {
    await this.ensurePage(id);
    const page = await this.prisma.cmsPage.update({ where: { id }, data, include: pageInclude });
    const seoDescProvided = data.seoDesc !== undefined;
    if (seoDescProvided && typeof data.seoDesc === 'string' && data.seoDesc.trim()) return page;
    return this.maybeFillSeoDesc(page.id, page.seoDesc, page.sections);
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
    const section = await this.prisma.cmsPageSection.create({
      data: {
        pageId,
        widgetType: body.widgetType,
        config: validated.data as Prisma.InputJsonValue,
        sortOrder: (max._max.sortOrder ?? -1) + 1,
        enabled: body.enabled ?? true,
      },
    });
    await this.refreshAutoSeoDesc(pageId);
    return section;
  }

  async updateSection(pageId: string, sectionId: string, body: Record<string, unknown>) {
    const section = await this.ensureSection(pageId, sectionId);
    const widgetType = (body.widgetType as string) ?? section.widgetType;
    const config = body.config !== undefined ? body.config : section.config;
    const validated = validateWidgetConfig(widgetType, config);
    if (!validated.ok) throw new ForbiddenException(validated.error);
    const updated = await this.prisma.cmsPageSection.update({
      where: { id: sectionId },
      data: {
        widgetType,
        config: validated.data as Prisma.InputJsonValue,
        ...(body.enabled !== undefined ? { enabled: Boolean(body.enabled) } : {}),
      },
    });
    await this.refreshAutoSeoDesc(pageId);
    return updated;
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

  private async refreshAutoSeoDesc(pageId: string) {
    const page = await this.prisma.cmsPage.findUnique({ where: { id: pageId }, include: pageInclude });
    if (!page || page.seoDesc?.trim()) return;
    await this.maybeFillSeoDesc(pageId, page.seoDesc, page.sections);
  }

  private async maybeFillSeoDesc(
    pageId: string,
    seoDesc: string | null | undefined,
    sections: { widgetType: string; config: unknown }[],
  ) {
    if (seoDesc?.trim()) {
      return this.prisma.cmsPage.findUnique({ where: { id: pageId }, include: pageInclude });
    }
    const generated = cmsSeoDescFromSections(sections);
    if (!generated) {
      return this.prisma.cmsPage.findUnique({ where: { id: pageId }, include: pageInclude });
    }
    return this.prisma.cmsPage.update({
      where: { id: pageId },
      data: { seoDesc: generated },
      include: pageInclude,
    });
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
