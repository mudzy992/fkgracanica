import type { SeedPrisma } from '../prisma-client';

const EVENTS = [
  {
    year: 1946,
    title: 'Osnivanje kluba',
    description: '<p>FK Gračanica osnovan je kao srce lokalne zajednice i ljubavi prema nogometu.</p>',
    sortOrder: 0,
  },
  {
    year: 1998,
    title: 'Prvi veliki uspjeh',
    description: '<p>Klub osvaja prvu značajniju regionalnu titulu i otvara novu eru razvoja.</p>',
    sortOrder: 1,
  },
  {
    year: 2015,
    title: 'Modernizacija infrastrukture',
    description: '<p>Rekonstrukcija stadiona i unapređenje omladinskog centra.</p>',
    sortOrder: 2,
  },
  {
    year: 2019,
    title: 'Povratak u vrh',
    description: '<p>Titula u regionalnom prvenstvu potvrđuje ambicije kluba.</p>',
    sortOrder: 3,
  },
] as const;

export async function seedClubTimeline(prisma: SeedPrisma) {
  for (const event of EVENTS) {
    const existing = await prisma.clubTimelineEvent.findFirst({
      where: { year: event.year, title: event.title },
    });
    if (existing) continue;
    await prisma.clubTimelineEvent.create({ data: event });
  }
}
