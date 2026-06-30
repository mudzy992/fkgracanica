import type { SeedPrisma } from '../prisma-client';

const ENTRIES = [
  {
    name: 'Mirza Sadiković',
    role: 'Kapetan legendi',
    years: '1998–2010',
    bio: 'Dugogodišnji kapetan i simbol kluba u zlatnoj eri.',
  },
  {
    name: 'Faruk Gačan',
    role: 'Golgeter',
    years: '2005–2015',
    bio: 'Najbolji strijelac u historiji kluba.',
  },
  {
    name: 'Muamer Sadiković',
    role: 'Trener',
    years: '2012–2018',
    bio: 'Vodio klub do najvećih uspjeha u ligi.',
  },
] as const;

export async function seedHeritage(prisma: SeedPrisma) {
  for (const entry of ENTRIES) {
    const existing = await prisma.hallOfFameEntry.findFirst({ where: { name: entry.name } });
    if (existing) {
      await prisma.hallOfFameEntry.update({ where: { id: existing.id }, data: entry });
    } else {
      await prisma.hallOfFameEntry.create({ data: entry });
    }
  }

  const MUSEUM = [
    { title: 'Prvi klupski dres', category: 'jersey', year: 1985, description: 'Originalni dres iz osnivačke sezone.' },
    { title: 'Kup trofej', category: 'trophy', year: 2021, description: 'Replika trofeja osvojenog u kupu.' },
    { title: 'Fotografija prvog tima', category: 'photo', year: 1990, description: 'Tim fotografija sa stadiona Gračanica.' },
  ] as const;

  for (const item of MUSEUM) {
    const existing = await prisma.museumItem.findFirst({ where: { title: item.title } });
    if (existing) await prisma.museumItem.update({ where: { id: existing.id }, data: item });
    else await prisma.museumItem.create({ data: item });
  }
}
