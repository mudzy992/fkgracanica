import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import type { NotificationsService } from '../notifications/notifications.service';
import { NewsService } from './news.service';

const legacy = 'https://notyoutube.com/watch?v=abc123XYZ01';
function fixture() {
  const tx = {
    news: {
      create: jest.fn().mockResolvedValue({ id: 'n' }),
      update: jest.fn().mockResolvedValue({ id: 'n' }),
    },
  };
  const prisma = {
    news: {
      findUnique: jest
        .fn()
        .mockImplementation(({ where }: { where: { id?: string } }) =>
          Promise.resolve(where.id ? { id: 'n', videoUrl: legacy } : null),
        ),
    },
    $transaction: jest.fn((fn: (client: typeof tx) => Promise<unknown>) =>
      fn(tx),
    ),
  };
  return {
    service: new NewsService(
      prisma as unknown as PrismaService,
      {} as NotificationsService,
    ),
    prisma,
    tx,
  };
}

describe('P-FE06-20 video URL vijesti', () => {
  it('odbija novi neispravan URL prije transakcije', async () => {
    const { service, prisma } = fixture();
    await expect(
      service.create({
        title: 'Test',
        content: 'Testni sadržaj',
        videoUrl: legacy,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
  it('dozvoljava sve ostale izmjene uz nepromijenjen neispravan legacy link, bez njegovog upisa', async () => {
    const { service, tx } = fixture();
    await service.update('n', { title: 'Novo', videoUrl: legacy });
    expect(tx.news.update).toHaveBeenCalledWith({
      where: { id: 'n' },
      data: { title: 'Novo' },
    });
  });
  it('odbija izmijenjeni neispravan link bez transakcije', async () => {
    const { service, prisma } = fixture();
    await expect(
      service.update('n', {
        title: 'Novo',
        videoUrl: 'https://youtu.be/short',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
  it.each([null, '', '   '])(
    'eksplicitno praznjenje %s pohranjuje null',
    async (videoUrl) => {
      const { service, tx } = fixture();
      await service.update('n', { videoUrl });
      expect(tx.news.update).toHaveBeenCalledWith({
        where: { id: 'n' },
        data: { videoUrl: null },
      });
    },
  );
  it('prihvata valjani shorts URL i trimuje samo novu vrijednost', async () => {
    const { service, tx } = fixture();
    await service.update('n', {
      videoUrl: ' https://youtube.com/shorts/abc123XYZ01 ',
    });
    expect(tx.news.update).toHaveBeenCalledWith({
      where: { id: 'n' },
      data: { videoUrl: 'https://youtube.com/shorts/abc123XYZ01' },
    });
  });
});
