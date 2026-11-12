import type { PrismaService } from '../prisma/prisma.service';
import { cmsSeoDescFromSections } from './cms-seo.util';

/**
 * Zajednički `include` za CMS stranicu (sve sekcije po redoslijedu) — izdvojen
 * iz `cms-pages.service` da servis ostane ispod file-size limita.
 */
export const cmsPageInclude = {
  sections: { orderBy: { sortOrder: 'asc' as const } },
};

type PageSections = { widgetType: string; config: unknown }[];

/**
 * Popunjava `seoDesc` iz prvog `rich-text` bloka — samo ako je opis prazan
 * (ručno upisan opis se nikad ne pregazi).
 */
export async function maybeFillSeoDesc(
  prisma: PrismaService,
  pageId: string,
  seoDesc: string | null | undefined,
  sections: PageSections,
) {
  if (seoDesc?.trim()) {
    return prisma.cmsPage.findUnique({
      where: { id: pageId },
      include: cmsPageInclude,
    });
  }
  const generated = cmsSeoDescFromSections(sections);
  if (!generated) {
    return prisma.cmsPage.findUnique({
      where: { id: pageId },
      include: cmsPageInclude,
    });
  }
  return prisma.cmsPage.update({
    where: { id: pageId },
    data: { seoDesc: generated },
    include: cmsPageInclude,
  });
}

/** Osvježava auto opis nakon izmjene sekcija (samo ako je opis prazan). */
export async function refreshAutoSeoDesc(
  prisma: PrismaService,
  pageId: string,
) {
  const page = await prisma.cmsPage.findUnique({
    where: { id: pageId },
    include: cmsPageInclude,
  });
  if (!page || page.seoDesc?.trim()) return page;
  return maybeFillSeoDesc(prisma, pageId, page.seoDesc, page.sections);
}
