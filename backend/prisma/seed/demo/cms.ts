import type { SeedPrisma } from '../prisma-client';
import { ContentStatus } from '@prisma/client';

const HOME_SECTIONS = [
  {
    widgetType: 'hero',
    config: {
      foundedYear: '1920',
      title: 'FK Gračanica',
      subtitle: 'Ponos grada. Srce na terenu.',
      buttons: [
        { label: 'Sljedeća utakmica', url: '/liga', variant: 'primary' },
        { label: 'Vijesti', url: '/vijesti', variant: 'outline' },
      ],
    },
  },
  { widgetType: 'next-match', config: {} },
  { widgetType: 'last-result', config: {} },
  {
    widgetType: 'news-feed',
    config: { limit: 3, mode: 'latest', viewAllUrl: '/vijesti', viewAllLabel: 'Sve vijesti' },
  },
  { widgetType: 'featured-players', config: { limit: 4 } },
  { widgetType: 'league-table', config: {} },
  {
    widgetType: 'gallery',
    config: { limit: 4, mode: 'latest', viewAllUrl: '/galerija', viewAllLabel: 'Sva galerija' },
  },
  { widgetType: 'sponsors', config: { limit: 6, viewAllUrl: '/sponzori' } },
  { widgetType: 'membership-cta', config: {} },
  { widgetType: 'tickets-cta', config: {} },
  { widgetType: 'trophies', config: { limit: 6, viewAllUrl: '/trofeji' } },
  { widgetType: 'newsletter', config: {} },
] as const;

const MAIN_MENU = [
  { label: 'Početna', path: '/', sortOrder: 0 },
  { label: 'O klubu', path: '/o-klubu', sortOrder: 1 },
  { label: 'Vijesti', path: '/vijesti', sortOrder: 2 },
  { label: 'Galerija', path: '/galerija', sortOrder: 3 },
  { label: 'Tim', path: '/tim', sortOrder: 4 },
  { label: 'Liga', path: '/liga', sortOrder: 5 },
  { label: 'Sponzori', path: '/sponzori', sortOrder: 6 },
  { label: 'Trofeji', path: '/trofeji', sortOrder: 7 },
  { label: 'Kontakt', path: '/kontakt', sortOrder: 8 },
] as const;

const FOOTER_TEXT =
  'FK Gračanica je fudbalski klub sa tradicijom, posvećen razvoju mladih igrača i jakoj vezi sa zajednicom.';

export async function seedCmsPages(prisma: SeedPrisma) {
  const home = await prisma.cmsPage.upsert({
    where: { slug: 'home' },
    create: {
      slug: 'home',
      title: 'Naslovna',
      status: ContentStatus.PUBLISHED,
      isSystem: true,
      seoTitle: 'Početna',
      seoDesc: 'Službena web stranica FK Gračanica',
    },
    update: { status: ContentStatus.PUBLISHED },
  });

  const sectionCount = await prisma.cmsPageSection.count({ where: { pageId: home.id } });
  if (sectionCount === 0) {
    await prisma.cmsPageSection.createMany({
      data: HOME_SECTIONS.map((s, i) => ({
        pageId: home.id,
        widgetType: s.widgetType,
        config: s.config,
        sortOrder: i,
      })),
    });
  }

  await prisma.cmsPage.upsert({
    where: { slug: 'site' },
    create: {
      slug: 'site',
      title: 'Globalni sadržaj',
      status: ContentStatus.PUBLISHED,
      isSystem: true,
      sections: {
        create: [{ widgetType: 'footer-about', config: { text: FOOTER_TEXT }, sortOrder: 0 }],
      },
    },
    update: {},
  });

  const menu = await prisma.cmsMenu.upsert({
    where: { key: 'main' },
    create: { key: 'main' },
    update: {},
  });

  const menuCount = await prisma.cmsMenuItem.count({ where: { menuId: menu.id } });
  if (menuCount === 0) {
    await prisma.cmsMenuItem.createMany({
      data: MAIN_MENU.map((item) => ({
        menuId: menu.id,
        label: item.label,
        path: item.path,
        sortOrder: item.sortOrder,
        isSystem: true,
        enabled: true,
      })),
    });
  } else {
    await prisma.cmsMenuItem.updateMany({
      where: { menuId: menu.id, path: { in: MAIN_MENU.map((m) => m.path) } },
      data: { isSystem: true },
    });
  }
}
