import type { SeedPrisma } from '../prisma-client';

const EVENTS = [
  {
    year: 1946,
    title: 'Srce grada',
    description:
      '<p>Nismo krenuli s titulama. Krenuli smo s loptom, dvorištem i ljudima koji su htjeli da Gračanica ima svoj klub. Od tog dana igramo za svoje.</p>',
    sortOrder: 0,
  },
  {
    year: 1978,
    title: 'Djeca na terenu',
    description:
      '<p>Omladinski pogon prestaje biti usputna priča. Terene pune dječaci iz mahala, a klub počinje mjeriti budućnost brojem malih dresova, ne samo rezultatom.</p>',
    sortOrder: 1,
  },
  {
    year: 1998,
    title: 'Prvi veliki dah',
    description:
      '<p>Te godine tribinama nije trebao raspored da znaju šta se dešava. Titula je stigla, ali jači od pehara bio je osjećaj: možemo više.</p>',
    sortOrder: 2,
  },
  {
    year: 2015,
    title: 'Novi stadion, stari ponos',
    description:
      '<p>Beton, svjetla, svlačionice — ali ista zemlja. Rekonstrukcija nije bila luksuz. Bila je poruka narednoj generaciji da ovdje ima gdje rasti.</p>',
    sortOrder: 3,
  },
  {
    year: 2019,
    title: 'Povratak u vrh',
    description:
      '<p>Nismo tražili nostalgiju. Tražili smo dokaz. Regionalna titula je vratila klub tamo gdje pripada — među one koji se bore za vrh, ne za uspomenu.</p>',
    sortOrder: 4,
  },
  {
    year: 2023,
    title: 'Nova generacija',
    description:
      '<p>Ista boja dresa. Nova imena. Priča nije arhiva — piše se svakog vikenda, pred istim ljudima koji su je počeli.</p>',
    sortOrder: 5,
  },
] as const;

export async function seedClubTimeline(prisma: SeedPrisma) {
  for (const event of EVENTS) {
    const existing = await prisma.clubTimelineEvent.findFirst({ where: { year: event.year } });
    if (existing) {
      await prisma.clubTimelineEvent.update({
        where: { id: existing.id },
        data: { title: event.title, description: event.description, sortOrder: event.sortOrder },
      });
      continue;
    }
    await prisma.clubTimelineEvent.create({ data: event });
  }
}
