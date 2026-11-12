import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import type { RealtimeGateway } from '../realtime/realtime.gateway';
import type { StatisticsService } from '../statistics/statistics.service';
import type { LiveFanoutService } from '../notifications/live-fanout.service';
import { LiveService } from './live.service';

function fixture() {
  const prisma = {
    match: {
      update: jest.fn().mockResolvedValue({ id: 'm' }),
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };
  const realtime = { emitMatchStatus: jest.fn() };
  const service = new LiveService(
    prisma as unknown as PrismaService,
    realtime as unknown as RealtimeGateway,
    {} as StatisticsService,
    {} as LiveFanoutService,
  );
  return { service, prisma, realtime };
}

describe('P-FE06-20 live stream URL', () => {
  it('odbija lažan host i ne emituje događaj niti vrši upis', async () => {
    const { service, prisma, realtime } = fixture();
    await expect(
      service.setLiveStream('m', 'https://notyoutube.com/watch?v=abc123XYZ01'),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.match.update).not.toHaveBeenCalled();
    expect(realtime.emitMatchStatus).not.toHaveBeenCalled();
  });
  it('ne prepisuje nepromijenjeni neispravni legacy URL', async () => {
    const { service, prisma, realtime } = fixture();
    const current = {
      id: 'm',
      liveStreamUrl: 'https://notyoutube.com/watch?v=abc123XYZ01',
    };
    prisma.match.findUnique.mockResolvedValue(current);
    await expect(
      service.setLiveStream('m', current.liveStreamUrl),
    ).resolves.toEqual(current);
    expect(prisma.match.update).not.toHaveBeenCalled();
    expect(realtime.emitMatchStatus).not.toHaveBeenCalled();
  });
  it('prihvata live link i eksplicitno uklanjanje', async () => {
    const { service, prisma } = fixture();
    await service.setLiveStream('m', ' https://youtube.com/live/abc123XYZ01 ');
    expect(prisma.match.update).toHaveBeenLastCalledWith({
      where: { id: 'm' },
      data: { liveStreamUrl: 'https://youtube.com/live/abc123XYZ01' },
    });
    await service.setLiveStream('m', null);
    expect(prisma.match.update).toHaveBeenLastCalledWith({
      where: { id: 'm' },
      data: { liveStreamUrl: null },
    });
    await service.setLiveStream('m', '   ');
    expect(prisma.match.update).toHaveBeenLastCalledWith({
      where: { id: 'm' },
      data: { liveStreamUrl: null },
    });
  });
});
