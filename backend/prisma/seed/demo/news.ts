import { ContentStatus } from '@prisma/client';
import type { SeedPrisma } from '../prisma-client';

const NEWS_ITEMS = [
  {
    slug: 'dobrodoslica-na-novu-stranicu',
    title: 'Dobrodošli na novu službenu web stranicu',
    excerpt: 'FK Gračanica predstavlja modernu digitalnu platformu za navijače, članove i partnere.',
    content:
      '<p>Početkom nove sezone pokrećemo ažuriranu web stranicu sa vijestima, rasporedom utakmica, live centrom i mogućnošću online rezervacije ulaznica.</p>',
  },
  {
    slug: 'pripreme-za-novu-sezonu',
    title: 'Pripreme za novu sezonu u punom jeku',
    excerpt: 'Prvi tim intenzivno trenira pred početak prvenstvenih obaveza.',
    content:
      '<p>Igrači i stručni štab rade na fizičkoj i taktičkoj pripremi. Klub poziva navijače da podrže ekipu na predstojećim utakmicama.</p>',
  },
  {
    slug: 'poziv-sponzorima',
    title: 'Klub poziva nove sponzore i partnere',
    excerpt: 'Otvoreni smo za saradnju sa lokalnim i regionalnim kompanijama.',
    content:
      '<p>Podrška sponzora omogućava razvoj omladinskih kategorija i unapređenje infrastrukture. Za više informacija kontaktirajte klub putem kontakt forme.</p>',
  },
] as const;

export async function seedNews(prisma: SeedPrisma, adminUserId: string | null) {
  let category = await prisma.newsCategory.findUnique({ where: { slug: 'klub' } });
  if (!category) {
    category = await prisma.newsCategory.create({ data: { name: 'Klub', slug: 'klub' } });
  }

  for (const item of NEWS_ITEMS) {
    const existing = await prisma.news.findUnique({ where: { slug: item.slug } });
    if (existing) continue;

    await prisma.news.create({
      data: {
        ...item,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        authorId: adminUserId ?? undefined,
        categoryId: category.id,
      },
    });
  }
}
