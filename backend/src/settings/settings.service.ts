import { Injectable, OnModuleInit } from '@nestjs/common';
import { SettingScope } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SETTINGS_REGISTRY, settingDefToCreate } from './settings.registry';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { validateModuleSettingUpdates } from './module-settings.util';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  async onModuleInit() {
    await this.ensureDefaults();
  }

  async getPublic() {
    const settings = await this.prisma.setting.findMany({
      where: { scope: SettingScope.PUBLIC },
    });
    return this.toKeyValue(settings);
  }

  async getPrivate() {
    const settings = await this.prisma.setting.findMany({
      where: { scope: SettingScope.PRIVATE },
    });
    return this.toKeyValue(settings);
  }

  /** Javni on/off flagovi modula (public + private scope) za routing i navigaciju. */
  async getModuleFlags() {
    const settings = await this.prisma.setting.findMany({
      where: {
        OR: [{ key: { startsWith: 'modules.' } }, { key: { startsWith: 'feature.' } }],
      },
    });
    return this.toKeyValue(settings);
  }

  async updatePublic(updates: Record<string, string>, actorId?: string) {
    return this.updateByScope(SettingScope.PUBLIC, updates, actorId);
  }

  async updatePrivate(updates: Record<string, string>, actorId?: string) {
    return this.updateByScope(SettingScope.PRIVATE, updates, actorId);
  }

  async ensureDefaults() {
    for (const def of SETTINGS_REGISTRY) {
      await this.prisma.setting.upsert({
        where: { key: def.key },
        create: settingDefToCreate(def),
        update: {},
      });
    }
  }

  private async updateByScope(
    scope: SettingScope,
    updates: Record<string, string>,
    actorId?: string,
  ) {
    const [pub, priv] = await Promise.all([this.getPublic(), this.getPrivate()]);
    validateModuleSettingUpdates({ ...pub, ...priv, ...updates }, updates);

    const keys = Object.keys(updates);
    await Promise.all(
      keys.map((key) =>
        this.prisma.setting.updateMany({
          where: { key, scope },
          data: { value: updates[key] },
        }),
      ),
    );
    const result =
      scope === SettingScope.PUBLIC
        ? await this.getPublic()
        : await this.getPrivate();
    this.realtime.emitSettingsChanged(scope, result);
    if (actorId) {
      await this.audit.log({
        actorId,
        action: 'settings.update',
        entity: 'setting',
        metadata: { scope, keys },
      });
      await this.notifications.create({
        userId: actorId,
        title: 'Postavke ažurirane',
        body: `Ažurirano ${keys.length} ${scope === SettingScope.PUBLIC ? 'javnih' : 'privatnih'} postavki.`,
        type: 'settings.updated',
        metadata: { scope, keys },
      });
    }
    return result;
  }

  private toKeyValue(
    settings: { key: string; value: string; type: string; description: string | null }[],
  ) {
    return settings.reduce<Record<string, string>>((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
  }
}
