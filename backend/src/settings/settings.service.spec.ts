jest.mock('@prisma/client', () => {
  // SettingScope/SettingType su RUNTIME enumi u settings servisu — sentinel
  // radi lokalno i u CI-ju (istovjetan identitet u oba okruženja).
  const makeSentinel = (): unknown => {
    const target: Record<string, unknown> = {};
    return new Proxy(target, {
      get: (t, prop) => {
        if (prop === 'PrismaClient') return class PrismaClientMock {};
        if (prop === 'then' || prop === 'toJSON') return undefined;
        if (prop === 'toString') return () => '[prisma-mock]';
        if (prop === Symbol.toPrimitive) return () => '[prisma-mock]';
        if (typeof prop === 'symbol') return Reflect.get(t, prop) as unknown;
        if (!(prop in t)) t[prop] = makeSentinel();
        return t[prop];
      },
      has: () => true,
    });
  };
  return makeSentinel();
});
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SettingScope } from '@prisma/client';
import { SettingsService } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

/**
 * BE-03: unit testovi SettingsService — fokus na SIGURNOSNE invarijante:
 *  - scope enforcement (updateMany uvijek nosi where.scope → cross-scope
 *    upis je u DB tihi no-op; registry redovi su jedini izvor dozvola);
 *  - zavisnosti modula (feature.live zahtijeva modules.competitions);
 *  - audit + in-app obavijest nakon izmjene.
 */
describe('SettingsService (BE-03)', () => {
  let service: SettingsService;
  const prismaMock = {
    setting: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      upsert: jest.fn(),
    },
    club: { findFirst: jest.fn() },
  };
  const realtimeMock = { emitSettingsChanged: jest.fn() };
  const notificationsMock = { create: jest.fn() };
  const auditMock = { log: jest.fn<void, [Record<string, unknown>]>() };

  const row = (key: string, value: string) => ({
    key,
    value,
    type: 'STRING',
    description: null,
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.setting.findMany.mockResolvedValue([]);
    prismaMock.setting.updateMany.mockResolvedValue({ count: 1 });
    const module = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RealtimeGateway, useValue: realtimeMock },
        { provide: NotificationsService, useValue: notificationsMock },
        { provide: AuditService, useValue: auditMock },
      ],
    }).compile();
    service = module.get(SettingsService);
  });

  it('updatePublic: svaki key ide u updateMany SA scope=PUBLIC (zaštita cross-scope upisa)', async () => {
    await service.updatePublic({ 'club.name': 'FK Test' }, 'actor-1');

    expect(prismaMock.setting.updateMany).toHaveBeenCalledWith({
      where: { key: 'club.name', scope: SettingScope.PUBLIC },
      data: { value: 'FK Test' },
    });
    expect(realtimeMock.emitSettingsChanged).toHaveBeenCalledWith(
      SettingScope.PUBLIC,
      expect.any(Object),
    );
  });

  it('updatePrivate: scope=PRIVATE (privatni ključ ne može ući u javni upis)', async () => {
    await service.updatePrivate({ 'smtp.password': 'x' }, 'actor-1');

    expect(prismaMock.setting.updateMany).toHaveBeenCalledWith({
      where: { key: 'smtp.password', scope: SettingScope.PRIVATE },
      data: { value: 'x' },
    });
    // PRIVATE scope ne emituje se kao javni event istog obrađivača
    expect(realtimeMock.emitSettingsChanged).toHaveBeenCalledWith(
      SettingScope.PRIVATE,
      expect.any(Object),
    );
  });

  it('nakon izmjene: audit zapis + in-app obavijest s listom ključeva (bez vrijednosti)', async () => {
    await service.updatePublic({ 'contact.email': 'novi@x.ba' }, 'actor-9');

    expect(auditMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'actor-9',
        action: 'settings.update',
        entity: 'setting',
      }),
    );
    expect(notificationsMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'actor-9' }),
    );
    // ključevi DA, vrijednosti NE (ne logiramo sadržaj postavki u obavijest)
    const meta = auditMock.log.mock.calls[0][0] as {
      metadata: { keys: string[] };
    };
    expect(meta.metadata.keys).toEqual(['contact.email']);
    expect(JSON.stringify(meta.metadata.keys)).not.toContain('novi@x.ba');
  });

  it('zavisnost modula: ne može se isključiti modules.competitions dok je feature.live uključen', async () => {
    prismaMock.setting.findMany.mockImplementation(
      (args: { where: { scope?: unknown } }) => {
        const isPrivate = args?.where?.scope === SettingScope.PRIVATE;
        return Promise.resolve(
          isPrivate
            ? [row('feature.live', 'true')]
            : [row('modules.competitions', 'true')],
        );
      },
    );

    await expect(
      service.updatePrivate({ 'modules.competitions': 'false' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    // odbijeno PRIJE bilo kojeg upisa
    expect(prismaMock.setting.updateMany).not.toHaveBeenCalled();
  });

  it('zavisnost modula: ne može se uključiti feature.live bez modules.competitions', async () => {
    prismaMock.setting.findMany.mockResolvedValue([
      row('modules.competitions', 'false'),
    ]);

    await expect(
      service.updatePrivate({ 'feature.live': 'true' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.setting.updateMany).not.toHaveBeenCalled();
  });

  it('getModuleFlags: vraća isključivo modules.*/feature.* ključeve (namjerno javni)', async () => {
    prismaMock.setting.findMany.mockResolvedValue([
      row('modules.news', 'true'),
      row('feature.live', 'false'),
    ]);

    const flags = await service.getModuleFlags();

    expect(flags).toEqual({ 'modules.news': 'true', 'feature.live': 'false' });
    expect(prismaMock.setting.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { key: { startsWith: 'modules.' } },
          { key: { startsWith: 'feature.' } },
        ],
      },
    });
  });
});
