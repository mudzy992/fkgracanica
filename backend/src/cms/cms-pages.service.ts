import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { validateWidgetConfig } from './widgets/schemas';
import {
  cmsPageInclude,
  maybeFillSeoDesc,
  refreshAutoSeoDesc,
} from './cms-auto-seo.util';

@Injectable()
export class CmsPagesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(admin = false) {
    return this.prisma.cmsPage.findMany({
      where: admin ? undefined : { status: ContentStatus.PUBLISHED },
      orderBy: { title: 'asc' },
      include: admin ? cmsPageInclude : undefined,
    });
  }

  async findBySlug(slug: string, admin = false) {
    const page = await this.prisma.cmsPage.findUnique({
      where: { slug },
      include: cmsPageInclude,
    });
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
    const page = await this.prisma.cmsPage.create({
      data,
      include: cmsPageInclude,
    });
    return maybeFillSeoDesc(this.prisma, page.id, page.seoDesc, page.sections);
  }

  async update(id: string, data: Prisma.CmsPageUpdateInput) {
    await this.ensurePage(id);
    const page = await this.prisma.cmsPage.update({
      where: { id },
      data,
      include: cmsPageInclude,
    });
    const seoDescProvided = data.seoDesc !== undefined;
    if (
      seoDescProvided &&
      typeof data.seoDesc === 'string' &&
      data.seoDesc.trim()
    )
      return page;
    return maybeFillSeoDesc(this.prisma, page.id, page.seoDesc, page.sections);
  }

  async remove(id: string) {
    const page = await this.ensurePage(id);
    if (page.isSystem)
      throw new ForbiddenException('Sistemska stranica se ne može obrisati');
    if (page.status !== ContentStatus.DRAFT) {
      throw new ForbiddenException(
        'Samo stranice u statusu Nacrt mogu biti obrisane',
      );
    }
    return this.prisma.cmsPage.delete({ where: { id } });
  }

  async addSection(
    pageId: string,
    body: { widgetType: string; config?: object; enabled?: boolean },
  ) {
    await this.ensurePage(pageId);
    // BE-09b/P-B09b-6: poslovna validacija je 400, ne 403.
    const validated = validateWidgetConfig(body.widgetType, body.config ?? {});
    if (!validated.ok) throw new BadRequestException(validated.error);
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
    await refreshAutoSeoDesc(this.prisma, pageId);
    return section;
  }

  async updateSection(
    pageId: string,
    sectionId: string,
    body: Record<string, unknown>,
  ) {
    const section = await this.ensureSection(pageId, sectionId);
    const widgetType = (body.widgetType as string) ?? section.widgetType;
    const config = body.config !== undefined ? body.config : section.config;
    // BE-09b/P-B09b-6: poslovna validacija je 400, ne 403.
    const validated = validateWidgetConfig(widgetType, config);
    if (!validated.ok) throw new BadRequestException(validated.error);
    const updated = await this.prisma.cmsPageSection.update({
      where: { id: sectionId },
      data: {
        widgetType,
        config: validated.data as Prisma.InputJsonValue,
        ...(body.enabled !== undefined
          ? { enabled: Boolean(body.enabled) }
          : {}),
      },
    });
    await refreshAutoSeoDesc(this.prisma, pageId);
    return updated;
  }

  async removeSection(pageId: string, sectionId: string) {
    await this.ensureSection(pageId, sectionId);
    return this.prisma.cmsPageSection.delete({ where: { id: sectionId } });
  }

  async reorderSections(pageId: string, ids: string[]) {
    await this.ensurePage(pageId);
    // BE-09b/P-B09b-3: sekcije MORAJU pripadati ovoj stranici — prije je
    // `where: { id }` dopuštao da se preko :pageId pregaze sekcije tuđe
    // stranice (galerija je već radila ispravno).
    const sections = await this.prisma.cmsPageSection.findMany({
      where: { id: { in: ids }, pageId },
      select: { id: true },
    });
    const owned = new Set(sections.map((s) => s.id));
    const foreign = ids.filter((id) => !owned.has(id));
    if (foreign.length) {
      throw new BadRequestException(
        `Sekcije ne pripadaju ovoj stranici: ${foreign.join(', ')}`,
      );
    }
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.cmsPageSection.update({
          where: { id, pageId },
          data: { sortOrder: index },
        }),
      ),
    );
    return this.prisma.cmsPageSection.findMany({
      where: { pageId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  private async ensurePage(id: string) {
    const page = await this.prisma.cmsPage.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Stranica nije pronađena');
    return page;
  }

  private async ensureSection(pageId: string, sectionId: string) {
    const section = await this.prisma.cmsPageSection.findFirst({
      where: { id: sectionId, pageId },
    });
    if (!section) throw new NotFoundException('Sekcija nije pronađena');
    return section;
  }
}
