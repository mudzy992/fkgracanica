import { Injectable } from '@nestjs/common';
import { SettingScope } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SETTINGS_REGISTRY } from './settings.registry';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

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

  async updatePublic(updates: Record<string, string>) {
    return this.updateByScope(SettingScope.PUBLIC, updates);
  }

  async updatePrivate(updates: Record<string, string>) {
    return this.updateByScope(SettingScope.PRIVATE, updates);
  }

  async ensureDefaults() {
    for (const def of SETTINGS_REGISTRY) {
      await this.prisma.setting.upsert({
        where: { key: def.key },
        create: def,
        update: {},
      });
    }
  }

  private async updateByScope(
    scope: SettingScope,
    updates: Record<string, string>,
  ) {
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
