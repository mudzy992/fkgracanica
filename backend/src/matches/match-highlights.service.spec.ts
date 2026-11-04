import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { MatchHighlightsService } from './match-highlights.service';

function fixture() {
  const prisma = {
    match: { findUnique: jest.fn().mockResolvedValue({ id: 'match' }) },
    matchHighlight: {
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn().mockResolvedValue({ id: 'new' }),
      findFirst: jest
        .fn()
        .mockResolvedValue({ id: 'old', youtubeUrl: 'https://legacy.invalid' }),
      update: jest.fn().mockResolvedValue({ id: 'old' }),
    },
  };
  return {
    prisma,
    service: new MatchHighlightsService(prisma as unknown as PrismaService),
  };
}

describe('validacija YouTube highlighta', () => {
  it('odbija lažnu domenu prije upisa', async () => {
    const { prisma, service } = fixture();
    await expect(
      service.create('match', {
        title: 'Test',
        youtubeUrl: 'https://youtube.com.example.invalid/watch?v=abc123XYZ01',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.matchHighlight.create).not.toHaveBeenCalled();
    expect(prisma.matchHighlight.count).not.toHaveBeenCalled();
  });
  it.each([
    'https://youtube.com/live/abc123XYZ01',
    'https://youtube.com/shorts/abc123XYZ01',
  ])('sprema valjani oblik %s', async (youtubeUrl) => {
    const { prisma, service } = fixture();
    await service.create('match', { title: ' Test ', youtubeUrl });
    expect(prisma.matchHighlight.create).toHaveBeenCalledWith({
      data: {
        matchId: 'match',
        title: 'Test',
        youtubeUrl,
        startSeconds: undefined,
        sortOrder: 1,
      },
    });
  });
  it('pri updateu odbija prazan i neispravan URL, bez izmjene postojećeg reda', async () => {
    const { prisma, service } = fixture();
    for (const youtubeUrl of [
      '',
      '   ',
      'https://notyoutube.com/watch?v=abc123XYZ01',
    ]) {
      await expect(
        service.update('match', 'old', { youtubeUrl }),
      ).rejects.toThrow(BadRequestException);
    }
    expect(prisma.matchHighlight.update).not.toHaveBeenCalled();
  });
  it('dozvoljava uređivanje naslova starog reda bez promjene njegovog URL-a', async () => {
    const { prisma, service } = fixture();
    await service.update('match', 'old', { title: 'Novo' });
    expect(prisma.matchHighlight.update).toHaveBeenCalledWith({
      where: { id: 'old' },
      data: { title: 'Novo' },
    });
  });
});
