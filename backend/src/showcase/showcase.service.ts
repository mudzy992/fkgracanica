import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SHOWCASE_MODULES } from './catalog-modules';
import { SHOWCASE_SECTIONS } from './catalog-sections';
import { SHOWCASE_ROLES } from './catalog-roles';
import {
  isShowcaseModeOn,
  overallPercentFrom,
  type PlatformStatusPayload,
  type ShowcaseBadge,
  type ShowcasePayload,
} from './showcase.types';

@Injectable()
export class ShowcaseService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublic(): Promise<ShowcasePayload> {
    const keys = [
      'feature.showcaseMode',
      'club.name',
      'club.tagline',
      'club.crestUrl',
      'contact.email',
      'contact.phone',
      'contact.address',
      'showcase.launchNote',
    ];
    const rows = await this.prisma.setting.findMany({
      where: { key: { in: keys } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    return {
      modeOn: isShowcaseModeOn(map['feature.showcaseMode']),
      overallPercent: overallPercentFrom(SHOWCASE_MODULES),
      club: {
        name: map['club.name'] || 'FK Gračanica',
        tagline: map['club.tagline'] || '',
        crestUrl: map['club.crestUrl'] || '',
        email: map['contact.email'] || '',
        phone: map['contact.phone'] || '',
        address: map['contact.address'] || '',
        launchNote: map['showcase.launchNote'] || '',
      },
      modules: SHOWCASE_MODULES,
      sections: SHOWCASE_SECTIONS,
      roles: SHOWCASE_ROLES,
    };
  }

  getStatus(): PlatformStatusPayload {
    const modules = SHOWCASE_MODULES;
    const counted = modules.filter((m) => m.badge !== 'after_launch');
    const count = (badge: ShowcaseBadge) =>
      modules.filter((m) => m.badge === badge).length;
    return {
      overallPercent: overallPercentFrom(modules),
      counted: counted.length,
      afterLaunch: modules.length - counted.length,
      counts: {
        ready: count('ready'),
        in_progress: count('in_progress'),
        web_only: count('web_only'),
        after_launch: count('after_launch'),
      },
      modules,
    };
  }
}
