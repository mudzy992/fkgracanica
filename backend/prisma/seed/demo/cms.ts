import type { SeedPrisma } from '../prisma-client';

const HERO_CONTENT = {
  foundedYear: '1920',
  title: 'FK Gračanica',
  subtitle: 'Ponos grada. Srce na terenu.',
  primaryCtaPath: '/liga',
  secondaryCtaPath: '/vijesti',
};

const FOOTER_ABOUT = {
  text: 'FK Gračanica je fudbalski klub sa tradicijom, posvećen razvoju mladih igrača i jakoj vezi sa zajednicom.',
};

export async function seedCmsBlocks(prisma: SeedPrisma) {
  await prisma.cmsBlock.upsert({
    where: { key: 'home.hero' },
    create: {
      key: 'home.hero',
      title: 'Naslovna hero sekcija',
      page: 'home',
      content: HERO_CONTENT,
    },
    update: {},
  });

  const footerExists = await prisma.cmsBlock.findUnique({ where: { key: 'footer.about' } });
  if (!footerExists) {
    await prisma.cmsBlock.create({
      data: {
        key: 'footer.about',
        title: 'O klubu (footer)',
        page: 'footer',
        content: FOOTER_ABOUT,
      },
    });
  }
}
