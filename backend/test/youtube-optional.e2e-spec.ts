import request from 'supertest';
import { youtubeOptionalFixture } from './youtube-optional-fixture';

const legacy = 'https://legacy.invalid/watch?v=short';
const invalid = 'https://notyoutube.com/watch?v=abc123XYZ01';
const valid = 'https://youtu.be/abc123XYZ01';

describe('FE-06 opcionalni YouTube URL API (izolovana testna baza)', () => {
  let f: Awaited<ReturnType<typeof youtubeOptionalFixture>>;
  beforeAll(async () => {
    f = await youtubeOptionalFixture();
  });
  afterAll(async () => {
    if (f) await f.close();
  });

  it('live: odbija novi, ne prepisuje nepromijenjeni legacy, dopušta uklanjanje i validni', async () => {
    const path = `/api/v1/live/matches/${f.matchId}/stream`;
    await f.prisma.match.update({
      where: { id: f.matchId },
      data: { liveStreamUrl: legacy },
    });
    const before = await f.prisma.match.findUniqueOrThrow({
      where: { id: f.matchId },
    });
    await request(f.app.getHttpServer())
      .patch(path)
      .send({ url: invalid })
      .expect(400);
    expect(
      await f.prisma.match.findUniqueOrThrow({ where: { id: f.matchId } }),
    ).toEqual(before);
    await request(f.app.getHttpServer())
      .patch(path)
      .send({ url: legacy })
      .expect(200);
    expect(
      await f.prisma.match.findUniqueOrThrow({ where: { id: f.matchId } }),
    ).toEqual(before);
    await request(f.app.getHttpServer())
      .patch(path)
      .send({ url: null })
      .expect(200);
    expect(
      (await f.prisma.match.findUniqueOrThrow({ where: { id: f.matchId } }))
        .liveStreamUrl,
    ).toBeNull();
    await request(f.app.getHttpServer())
      .patch(path)
      .send({ url: valid })
      .expect(200);
    expect(
      (await f.prisma.match.findUniqueOrThrow({ where: { id: f.matchId } }))
        .liveStreamUrl,
    ).toBe(valid);
  });

  it('news: novi invalidni nema upisa; drugi edit čuva legacy i ručno uklanjanje radi', async () => {
    const api = request(f.app.getHttpServer());
    await api
      .post('/api/v1/news')
      .send({
        title: 'New',
        slug: `fe06-${f.key}-invalid`,
        content: 'Sadržaj',
        videoUrl: invalid,
      })
      .expect(400);
    expect(
      await f.prisma.news.findUnique({
        where: { slug: `fe06-${f.key}-invalid` },
      }),
    ).toBeNull();
    const path = `/api/v1/news/${f.newsId}`;
    await api.patch(path).send({ title: 'Novo', videoUrl: legacy }).expect(200);
    const after = await f.prisma.news.findUniqueOrThrow({
      where: { id: f.newsId },
    });
    expect(after.title).toBe('Novo');
    expect(after.videoUrl).toBe(legacy);
    await api
      .patch(path)
      .send({ title: 'Ne smije', videoUrl: invalid })
      .expect(400);
    expect(
      await f.prisma.news.findUniqueOrThrow({ where: { id: f.newsId } }),
    ).toEqual(after);
    await api.patch(path).send({ videoUrl: null }).expect(200);
    expect(
      (await f.prisma.news.findUniqueOrThrow({ where: { id: f.newsId } }))
        .videoUrl,
    ).toBeNull();
    await api.patch(path).send({ videoUrl: valid }).expect(200);
    expect(
      (await f.prisma.news.findUniqueOrThrow({ where: { id: f.newsId } }))
        .videoUrl,
    ).toBe(valid);
  });

  it('settings: validacija cijelog batcha prije upisa i legacy/clear/valid', async () => {
    const key = 'live.prematchAudioUrl';
    const path = '/api/v1/settings/public';
    const api = request(f.app.getHttpServer());
    await f.prisma.setting.update({ where: { key }, data: { value: legacy } });
    const before = await f.prisma.setting.findUniqueOrThrow({ where: { key } });
    await api
      .put(path)
      .send({ [key]: invalid, [f.otherKey]: 'ne smije' })
      .expect(400);
    expect(
      await f.prisma.setting.findUniqueOrThrow({ where: { key } }),
    ).toEqual(before);
    expect(
      (await f.prisma.setting.findUniqueOrThrow({ where: { key: f.otherKey } }))
        .value,
    ).toBe('prije');
    await api
      .put(path)
      .send({ [key]: legacy, [f.otherKey]: 'poslije' })
      .expect(200);
    expect(
      await f.prisma.setting.findUniqueOrThrow({ where: { key } }),
    ).toEqual(before);
    expect(
      (await f.prisma.setting.findUniqueOrThrow({ where: { key: f.otherKey } }))
        .value,
    ).toBe('poslije');
    await api
      .put(path)
      .send({ [key]: '' })
      .expect(200);
    expect(
      (await f.prisma.setting.findUniqueOrThrow({ where: { key } })).value,
    ).toBe('');
    await api
      .put(path)
      .send({ [key]: valid })
      .expect(200);
    expect(
      (await f.prisma.setting.findUniqueOrThrow({ where: { key } })).value,
    ).toBe(valid);
  });
});
