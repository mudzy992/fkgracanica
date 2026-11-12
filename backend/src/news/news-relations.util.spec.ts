import type { Prisma } from '@prisma/client';
import {
  mapNewsUpdate,
  syncNewsRelations,
  syncNewsTags,
} from './news-relations.util';

/**
 * BE-09b/P-B09b-5: sync funkcije primaju transakcijski klijent (`tx`) i rade
 * delete → create u istom pozivu; poziv iz `NewsService` ide unutar
 * `$transaction`-a, pa pad `createMany`-a vraća i same tagove.
 */
describe('news-relations.util (BE-09b / P-B09b-5)', () => {
  const client = () => ({
    newsTag: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    newsMatch: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    newsPlayer: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
  });

  type Client = ReturnType<typeof client>;
  const asTx = (c: Client) => c as unknown as Prisma.TransactionClient;

  it('syncNewsTags: deduplikuje, trimuje i odbacuje prazne tagove', async () => {
    const c = client();
    await syncNewsTags(asTx(c), 'n1', [' derbi ', 'derbi', '', '   ', 'kup']);

    expect(c.newsTag.deleteMany).toHaveBeenCalledWith({
      where: { newsId: 'n1' },
    });
    expect(c.newsTag.createMany).toHaveBeenCalledWith({
      data: [
        { newsId: 'n1', name: 'derbi' },
        { newsId: 'n1', name: 'kup' },
      ],
    });
  });

  it('syncNewsTags: undefined → ne dira bazu', async () => {
    const c = client();
    await syncNewsTags(asTx(c), 'n1', undefined);

    expect(c.newsTag.deleteMany).not.toHaveBeenCalled();
  });

  it('syncNewsTags: prazna lista briše sve tagove bez createMany', async () => {
    const c = client();
    await syncNewsTags(asTx(c), 'n1', []);

    expect(c.newsTag.deleteMany).toHaveBeenCalled();
    expect(c.newsTag.createMany).not.toHaveBeenCalled();
  });

  it('syncNewsRelations: zamjenjuje utakmice i igrače', async () => {
    const c = client();
    await syncNewsRelations(asTx(c), 'n1', ['m1', 'm2'], ['p1']);

    expect(c.newsMatch.deleteMany).toHaveBeenCalledWith({
      where: { newsId: 'n1' },
    });
    expect(c.newsMatch.createMany).toHaveBeenCalledWith({
      data: [
        { newsId: 'n1', matchId: 'm1' },
        { newsId: 'n1', matchId: 'm2' },
      ],
    });
    expect(c.newsPlayer.createMany).toHaveBeenCalledWith({
      data: [{ newsId: 'n1', playerId: 'p1' }],
    });
  });

  it('syncNewsRelations: ne dira relacije koje nisu poslane', async () => {
    const c = client();
    await syncNewsRelations(asTx(c), 'n1', ['m1'], undefined);

    expect(c.newsPlayer.deleteMany).not.toHaveBeenCalled();
  });

  it('mapNewsUpdate: propušta samo dozvoljena polja', () => {
    const update = mapNewsUpdate({
      title: 'Naslov',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      id: 'hak',
      scheduledAt: '',
    });

    expect(update).toEqual({ title: 'Naslov', scheduledAt: null });
  });
});
