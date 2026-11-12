import request from 'supertest';
import { createLineupFixture } from './lineup-e2e-fixture';

describe('FE-06 YouTube highlight API (izolovana testna baza)', () => {
  let f: Awaited<ReturnType<typeof createLineupFixture>>;
  beforeAll(async () => {
    f = await createLineupFixture({ validateRequests: true });
  });
  afterAll(async () => {
    if (f) await f.close();
  });

  it('odbija lažne domene i encodiranu putanju bez stvaranja redova', async () => {
    const api = request(f.app.getHttpServer());
    const path = `/api/v1/matches/${f.matchId}/highlights`;
    for (const youtubeUrl of [
      'https://youtube.com.example.invalid/watch?v=abc123XYZ01',
      'https://notyoutube.com/watch?v=abc123XYZ01',
      'https://youtube.com/watch?v=..%2F..%2Fredirect%3Fq%3Dhttps%3A%2F%2Fexample.invalid',
      'https://youtu.be/short',
    ]) {
      await api
        .post(path)
        .send({ title: 'Neispravno', youtubeUrl })
        .expect(400);
    }
    expect(
      await f.prisma.matchHighlight.count({ where: { matchId: f.matchId } }),
    ).toBe(0);
  });

  it('prihvata live/shorts i čuva postojeći zapis pri neispravnom updateu', async () => {
    const api = request(f.app.getHttpServer());
    const path = `/api/v1/matches/${f.matchId}/highlights`;
    const live = await api
      .post(path)
      .send({
        title: 'Live',
        youtubeUrl: 'https://youtube.com/live/abc123XYZ01',
      })
      .expect(201);
    await api
      .post(path)
      .send({
        title: 'Short',
        youtubeUrl: 'https://youtube.com/shorts/abc123XYZ01',
      })
      .expect(201);
    const id = (live.body as { id: string }).id;
    const saved = await f.prisma.matchHighlight.findUniqueOrThrow({
      where: { id },
    });
    for (const youtubeUrl of [
      '',
      '   ',
      'https://youtube.com/watch?v=abc123XYZ01%0A',
    ]) {
      await api.patch(`${path}/${id}`).send({ youtubeUrl }).expect(400);
    }
    expect(
      await f.prisma.matchHighlight.findUniqueOrThrow({ where: { id } }),
    ).toEqual(saved);
    await api
      .patch(`${path}/${id}`)
      .send({ youtubeUrl: 'https://youtu.be/Ab_-1234xyz' })
      .expect(200);
    expect(
      (await f.prisma.matchHighlight.findUniqueOrThrow({ where: { id } }))
        .youtubeUrl,
    ).toBe('https://youtu.be/Ab_-1234xyz');
  });

  it('ne mijenja stari neispravni URL kada se mijenja samo naslov', async () => {
    const legacy = await f.prisma.matchHighlight.create({
      data: {
        matchId: f.matchId,
        title: 'Staro',
        youtubeUrl: 'https://legacy.invalid/watch?v=short',
        sortOrder: 2,
      },
    });
    await request(f.app.getHttpServer())
      .patch(`/api/v1/matches/${f.matchId}/highlights/${legacy.id}`)
      .send({ title: 'Novo' })
      .expect(200);
    const after = await f.prisma.matchHighlight.findUniqueOrThrow({
      where: { id: legacy.id },
    });
    expect(after.title).toBe('Novo');
    expect(after.youtubeUrl).toBe(legacy.youtubeUrl);
  });
});
