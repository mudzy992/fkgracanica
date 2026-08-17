import { Injectable } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { PaymentsReadinessService } from '../payments/payments-readiness.service';
import { PAYMENTS_ADMIN_KEYS } from '../payments/payments-settings';
import {
  activeTicketCategories,
  DEFAULT_TICKET_CATEGORIES,
  parseTicketCategories,
  type TicketCategoryDef,
} from './ticket-categories.util';

const TICKETING_CORE_KEYS = [
  'ticketing.stadiumCapacity',
  'ticketing.memberDiscountPercent',
  'ticketing.maxBoxOfficeTicketsPerUser',
  'ticketing.categories',
  'ticketing.ticketCardBackground',
  'ticketing.onlineEnabled',
  'ticketing.boxOfficeEnabled',
  'ticketing.seasonPassPrice',
  'ticketing.seasonPassLabel',
  'membership.onlineEnabled',
  'membership.annualPrice',
] as const;

const TICKETING_ADMIN_KEYS = [...TICKETING_CORE_KEYS, ...PAYMENTS_ADMIN_KEYS];

@Injectable()
export class TicketingConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly payments: PaymentsReadinessService,
  ) {}

  async getCategories(): Promise<TicketCategoryDef[]> {
    const row = await this.prisma.setting.findUnique({ where: { key: 'ticketing.categories' } });
    return parseTicketCategories(row?.value);
  }

  async getPublicConfig() {
    const [publicSettings, salesModes] = await Promise.all([
      this.settings.getPublic(),
      this.payments.getSalesModes(),
    ]);
    const categories = activeTicketCategories(
      parseTicketCategories(publicSettings['ticketing.categories']),
    );
    const membershipOnline =
      (await this.payments.isMembershipOnlineAllowed()) && salesModes.onlineReady;
    const offerSeason = await this.prisma.season.findFirst({ where: { isActive: true } });
    const seasonPassPrice = Number(publicSettings['ticketing.seasonPassPrice']) || 0;
    const seasonPassLabel = publicSettings['ticketing.seasonPassLabel'] || 'Sezonska karta';
    const priv = await this.settings.getPrivate();
    const activeTicketMatch = await this.findActiveScheduledHomeMatch();
    return {
      categories,
      stadiumCapacity: Number(publicSettings['ticketing.stadiumCapacity']) || 5000,
      memberDiscountPercent: Number(publicSettings['ticketing.memberDiscountPercent']) || 0,
      maxBoxOfficeTicketsPerUser:
        Number(publicSettings['ticketing.maxBoxOfficeTicketsPerUser']) || 4,
      membershipAnnualPrice: Number(publicSettings['membership.annualPrice']) || 0,
      ticketCardBackground: publicSettings['ticketing.ticketCardBackground'] || null,
      activeTicketMatch,
      salesModes,
      onlineReady: salesModes.onlineReady,
      readyProviders: salesModes.readyProviders,
      membershipOnlineEnabled: membershipOnline,
      modulesTicketing: publicSettings['modules.ticketing'] !== 'false',
      modulesMembership: priv['feature.membership'] !== 'false',
      seasonPassPrice,
      seasonPassLabel,
      seasonPassAvailable:
        !!offerSeason && seasonPassPrice > 0 && (salesModes.online || salesModes.boxOffice),
    };
  }

  async getAdminConfig() {
    const [pub, priv, salesModes, onlineReady, providerStatus] = await Promise.all([
      this.settings.getPublic(),
      this.settings.getPrivate(),
      this.payments.getSalesModes(),
      this.payments.isOnlinePaymentsReady(),
      this.getProviderStatus(),
    ]);
    const merged = { ...pub, ...priv };
    const config: Record<string, string> = {};
    for (const key of TICKETING_ADMIN_KEYS) {
      config[key] = merged[key] ?? '';
    }
    if (!config['ticketing.categories']) {
      config['ticketing.categories'] = JSON.stringify(DEFAULT_TICKET_CATEGORIES);
    }
    return {
      settings: config,
      salesModes,
      onlineReady,
      providerStatus,
      categories: parseTicketCategories(config['ticketing.categories']),
    };
  }

  private async getProviderStatus() {
    const [stripe, paypal, monri, defaultProvider] = await Promise.all([
      this.payments.getProviderGate('stripe'),
      this.payments.getProviderGate('paypal'),
      this.payments.getProviderGate('monri'),
      this.payments.getDefaultProvider(),
    ]);
    return { stripe, paypal, monri, defaultProvider };
  }

  async updateAdminConfig(updates: Record<string, string>, actorId?: string) {
    const publicKeys = new Set([
      'ticketing.stadiumCapacity',
      'ticketing.memberDiscountPercent',
      'ticketing.maxBoxOfficeTicketsPerUser',
      'ticketing.categories',
      'ticketing.ticketCardBackground',
      'ticketing.seasonPassPrice',
      'ticketing.seasonPassLabel',
      'membership.annualPrice',
      'payments.stripe.publishableKey',
    ]);
    const pub: Record<string, string> = {};
    const priv: Record<string, string> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (!TICKETING_ADMIN_KEYS.includes(key)) continue;
      if (publicKeys.has(key)) pub[key] = value;
      else priv[key] = value;
    }
    if (Object.keys(pub).length) await this.settings.updatePublic(pub, actorId);
    if (Object.keys(priv).length) await this.settings.updatePrivate(priv, actorId);
    return this.getAdminConfig();
  }

  findActiveScheduledHomeMatch() {
    return this.prisma.match.findFirst({
      where: {
        status: MatchStatus.SCHEDULED,
        homeClub: { isOwnClub: true },
      },
      include: {
        homeClub: true,
        awayClub: true,
        roundRel: { select: { id: true, number: true, name: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  findTicketableMatches() {
    return this.findActiveScheduledHomeMatch().then((m) => (m ? [m] : []));
  }

  findNextHomeMatch() {
    return this.findActiveScheduledHomeMatch();
  }
}
