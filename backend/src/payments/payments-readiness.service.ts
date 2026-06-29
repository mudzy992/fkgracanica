import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type PaymentProviderId = 'stripe' | 'paypal' | 'monri';

@Injectable()
export class PaymentsReadinessService {
  constructor(private readonly prisma: PrismaService) {}

  private async getPrivate(key: string): Promise<string> {
    const row = await this.prisma.setting.findUnique({ where: { key } });
    return row?.value ?? '';
  }

  private async getPublic(key: string): Promise<string> {
    const row = await this.prisma.setting.findUnique({ where: { key } });
    return row?.value ?? '';
  }

  private isTruthy(value: string) {
    return value === 'true' || value === '1';
  }

  async isProviderReady(provider: PaymentProviderId): Promise<boolean> {
    if (provider === 'stripe') {
      const [enabled, secret, publishable] = await Promise.all([
        this.getPrivate('payments.stripe.enabled'),
        this.getPrivate('payments.stripe.secretKey'),
        this.getPublic('payments.stripe.publishableKey'),
      ]);
      return this.isTruthy(enabled) && !!secret.trim() && !!publishable.trim();
    }
    if (provider === 'paypal') {
      const [enabled, clientId, clientSecret] = await Promise.all([
        this.getPrivate('payments.paypal.enabled'),
        this.getPrivate('payments.paypal.clientId'),
        this.getPrivate('payments.paypal.clientSecret'),
      ]);
      return this.isTruthy(enabled) && !!clientId.trim() && !!clientSecret.trim();
    }
    const [enabled, merchantKey, authKey] = await Promise.all([
      this.getPrivate('payments.monri.enabled'),
      this.getPrivate('payments.monri.merchantKey'),
      this.getPrivate('payments.monri.authenticationKey'),
    ]);
    return this.isTruthy(enabled) && !!merchantKey.trim() && !!authKey.trim();
  }

  async getDefaultProvider(): Promise<PaymentProviderId> {
    const raw = await this.getPrivate('payments.defaultProvider');
    if (raw === 'paypal' || raw === 'monri') return raw;
    return 'stripe';
  }

  async isOnlinePaymentsReady(): Promise<boolean> {
    const provider = await this.getDefaultProvider();
    return this.isProviderReady(provider);
  }

  async getSalesModes(): Promise<{ boxOffice: boolean; online: boolean; onlineReady: boolean }> {
    const [boxOffice, onlineEnabled, onlineReady] = await Promise.all([
      this.getPrivate('ticketing.boxOfficeEnabled'),
      this.getPrivate('ticketing.onlineEnabled'),
      this.isOnlinePaymentsReady(),
    ]);
    const boxOfficeOn = boxOffice !== 'false';
    const onlineOn = this.isTruthy(onlineEnabled) && onlineReady;
    return { boxOffice: boxOfficeOn, online: onlineOn, onlineReady };
  }

  async isMembershipOnlineAllowed(): Promise<boolean> {
    const [enabled, onlineReady] = await Promise.all([
      this.getPrivate('membership.onlineEnabled'),
      this.isOnlinePaymentsReady(),
    ]);
    return this.isTruthy(enabled) && onlineReady;
  }
}
