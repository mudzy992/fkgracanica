import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import type { RealtimeGateway } from '../realtime/realtime.gateway';
import type { NotificationsService } from '../notifications/notifications.service';
import type { AuditService } from '../audit/audit.service';
import { SettingsService } from './settings.service';

const legacy = 'https://notyoutube.com/watch?v=abc123XYZ01';
function fixture() {
  const prisma = {
    setting: {
      findMany: jest.fn().mockResolvedValue([
        {
          key: 'live.prematchAudioUrl',
          value: legacy,
          type: 'STRING',
          description: null,
        },
      ]),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };
  const realtime = { emitSettingsChanged: jest.fn() };
  const service = new SettingsService(
    prisma as unknown as PrismaService,
    realtime as unknown as RealtimeGateway,
    {} as NotificationsService,
    {} as AuditService,
  );
  return { prisma, service };
}

describe('P-FE06-20 pre-match audio postavka', () => {
  it('odbija neispravnu vrijednost prije bilo kojeg upisa iz batcha', async () => {
    const { service, prisma } = fixture();
    await expect(
      service.updatePublic({
        'club.name': 'Test',
        'live.prematchAudioUrl': 'https://youtu.be/short',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.setting.updateMany).not.toHaveBeenCalled();
  });
  it('ne upisuje nepromijenjeni legacy link, a ostale izmjene prolaze', async () => {
    const { service, prisma } = fixture();
    await service.updatePublic({
      'club.name': 'Test',
      'live.prematchAudioUrl': legacy,
    });
    expect(prisma.setting.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.setting.updateMany).toHaveBeenCalledWith({
      where: { key: 'club.name', scope: 'PUBLIC' },
      data: { value: 'Test' },
    });
  });
  it.each(['', '   '])(
    'eksplicitno praznjenje %s ostavlja prazan string',
    async (value) => {
      const { service, prisma } = fixture();
      await service.updatePublic({ 'live.prematchAudioUrl': value });
      expect(prisma.setting.updateMany).toHaveBeenCalledWith({
        where: { key: 'live.prematchAudioUrl', scope: 'PUBLIC' },
        data: { value: '' },
      });
    },
  );
  it('prihvata valjani URL', async () => {
    const { service, prisma } = fixture();
    await service.updatePublic({
      'live.prematchAudioUrl': ' https://youtu.be/abc123XYZ01 ',
    });
    expect(prisma.setting.updateMany).toHaveBeenCalledWith({
      where: { key: 'live.prematchAudioUrl', scope: 'PUBLIC' },
      data: { value: 'https://youtu.be/abc123XYZ01' },
    });
  });
});
