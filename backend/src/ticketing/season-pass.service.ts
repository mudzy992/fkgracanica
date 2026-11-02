import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsReadinessService } from '../payments/payments-readiness.service';
import { JobsService } from '../jobs/jobs.module';
import { NotificationsService } from '../notifications/notifications.service';
import { notifySeasonPassActive } from '../payments/payment-notify';
import { generateQrCode } from '../common/utils/qr.util';
import { countActivePasses } from './season-pass-capacity.util';
import { getStadiumCapacity } from './ticketing-query.util';

const passInclude = {
  user: { select: { id: true, email: true, firstName: true, lastName: true } },
  season: { select: { id: true, name: true } },
} as const;

@Injectable()
export class SeasonPassService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsReadinessService,
    private readonly jobs: JobsService,
    private readonly notifications: NotificationsService,
  ) {}

  async offer() {
    const [season, priceRow, labelRow] = await Promise.all([
      this.prisma.season.findFirst({ where: { isActive: true } }),
      this.prisma.setting.findUnique({
        where: { key: 'ticketing.seasonPassPrice' },
      }),
      this.prisma.setting.findUnique({
        where: { key: 'ticketing.seasonPassLabel' },
      }),
    ]);
    const price = Number(priceRow?.value || '0');
    const label = labelRow?.value?.trim() || 'Sezonska karta';
    const sales = await this.payments.getSalesModes();
    return {
      season,
      price,
      label,
      available: !!season && price > 0 && (sales.online || sales.boxOffice),
      salesModes: { boxOffice: sales.boxOffice, online: sales.online },
    };
  }

  async mine(userId: string) {
    const offer = await this.offer();
    if (!offer.season) return { offer, pass: null };
    const pass = await this.prisma.seasonPass.findUnique({
      where: { userId_seasonId: { userId, seasonId: offer.season.id } },
      include: passInclude,
    });
    return { offer, pass };
  }

  listAdmin() {
    return this.prisma.seasonPass.findMany({
      include: passInclude,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async openPending(userId: string) {
    const offer = await this.offer();
    if (!offer.season || offer.price <= 0) {
      throw new BadRequestException('Sezonska karta nije u prodaji');
    }
    const existing = await this.prisma.seasonPass.findUnique({
      where: { userId_seasonId: { userId, seasonId: offer.season.id } },
    });
    if (existing?.status === 'ACTIVE') {
      throw new BadRequestException('Već imate sezonsku kartu za ovu sezonu');
    }
    if (existing) {
      return this.prisma.seasonPass.update({
        where: { id: existing.id },
        data: {
          status: 'PENDING',
          price: new Prisma.Decimal(offer.price),
          label: offer.label,
        },
      });
    }
    const capacity = await getStadiumCapacity(this.prisma);
    const active = await countActivePasses(this.prisma, offer.season.id);
    if (active >= capacity)
      throw new BadRequestException('Kapacitet stadiona je popunjen');
    return this.prisma.seasonPass.create({
      data: {
        userId,
        seasonId: offer.season.id,
        label: offer.label,
        price: new Prisma.Decimal(offer.price),
        qrCode: generateQrCode('pass'),
        status: 'PENDING',
      },
    });
  }

  async issueBoxOffice(email: string) {
    const sales = await this.payments.getSalesModes();
    if (!sales.boxOffice)
      throw new BadRequestException('Blagajna nije omogućena');
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Korisnik nije pronađen');
    const pass = await this.openPending(user.id);
    const active = await this.prisma.seasonPass.update({
      where: { id: pass.id },
      data: { status: 'ACTIVE', paymentProvider: 'box_office' },
      include: passInclude,
    });
    await notifySeasonPassActive(
      this.prisma,
      this.jobs,
      pass.id,
      this.notifications,
    );
    return active;
  }

  async assertPayable(passId: string, userId: string) {
    const pass = await this.prisma.seasonPass.findFirst({
      where: { id: passId, userId },
    });
    if (!pass) throw new NotFoundException('Sezonska karta nije pronađena');
    if (pass.status !== 'PENDING') {
      throw new BadRequestException('Ova karta nije dostupna za online uplatu');
    }
    return pass;
  }
}
