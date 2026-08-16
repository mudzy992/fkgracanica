import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MembershipStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { PaymentsReadinessService } from '../payments/payments-readiness.service';
import { generateQrCode } from '../common/utils/qr.util';
import { JobsService } from '../jobs/jobs.module';
import { notifyMembershipActive } from '../payments/payment-notify';
import type { JoinMembershipDto } from './dto/join-membership.dto';
import { resolveExpiredMany, resolveExpiredOne } from './membership-expiry.util';

const userSelect = { id: true, email: true, firstName: true, lastName: true } as const;
const includeWithUser = { user: { select: userSelect }, card: true } as const;

@Injectable()
export class MembershipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly payments: PaymentsReadinessService,
    private readonly jobs: JobsService,
  ) {}

  async joinOnline(dto: JoinMembershipDto) {
    await this.assertMembershipModuleEnabled();
    const allowed = await this.payments.isMembershipOnlineAllowed();
    if (!allowed) {
      throw new BadRequestException('Online kupovina članstva trenutno nije omogućena');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException(
        'Račun s ovim emailom već postoji. Prijavite se i nastavite kupovinu članstva.',
      );
    }

    const memberRole = await this.prisma.role.findUnique({ where: { name: 'Član' } });
    if (!memberRole) throw new BadRequestException('Uloga člana nije konfigurisana');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName ?? null,
        lastName: dto.lastName ?? null,
        roles: { create: [{ roleId: memberRole.id }] },
      },
    });

    await this.assertNoPendingOrActive(user.id);
    const membership = await this.prisma.membership.create({
      data: { userId: user.id, status: MembershipStatus.PENDING },
    });

    const session = await this.auth.createSession(user.id);
    return { membership, ...session };
  }

  async assertPayableMembership(membershipId: string, userId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: membershipId, userId },
    });
    if (!membership) throw new NotFoundException('Članstvo nije pronađeno');
    const payable = (
      [MembershipStatus.PENDING, MembershipStatus.ACTIVE, MembershipStatus.EXPIRED] as MembershipStatus[]
    ).includes(membership.status);
    if (!payable) {
      throw new BadRequestException('Ovo članstvo nije dostupno za online uplatu');
    }
    return membership;
  }

  private async assertMembershipModuleEnabled() {
    const row = await this.prisma.setting.findUnique({ where: { key: 'feature.membership' } });
    if (row?.value === 'false') {
      throw new BadRequestException('Modul članstva trenutno nije aktivan');
    }
  }

  async register(userId: string) {
    await this.assertMembershipModuleEnabled();
    await this.assertNoPendingOrActive(userId, 'Već imate aktivno ili čekajuće članstvo');
    return this.prisma.membership.create({
      data: { userId, status: MembershipStatus.PENDING },
    });
  }

  async createForUser(email: string, activate = false) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Korisnik nije pronađen');
    await this.assertNoPendingOrActive(user.id);
    const membership = await this.prisma.membership.create({
      data: { userId: user.id, status: MembershipStatus.PENDING },
    });
    if (activate) await this.activate(membership.id);
    return this.findOne(membership.id);
  }

  async findForUser(userId: string) {
    const items = await this.prisma.membership.findMany({
      where: { userId },
      include: includeWithUser,
      orderBy: { createdAt: 'desc' },
    });
    return resolveExpiredMany(this.prisma, items);
  }

  async findAll(status?: MembershipStatus) {
    const where: Prisma.MembershipWhereInput = status ? { status } : {};
    const items = await this.prisma.membership.findMany({
      where,
      include: includeWithUser,
      orderBy: { createdAt: 'desc' },
    });
    return resolveExpiredMany(this.prisma, items);
  }

  async activate(id: string) {
    const membership = await this.prisma.membership.update({
      where: { id },
      data: {
        status: MembershipStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    const cardNumber = `FK-${membership.id.slice(-8).toUpperCase()}`;
    const card = await this.prisma.membershipCard.upsert({
      where: { membershipId: id },
      create: {
        membershipId: id,
        cardNumber,
        qrCode: generateQrCode(`member-${id}`),
      },
      update: {},
    });
    await notifyMembershipActive(this.prisma, this.jobs, id);
    return { membership, card };
  }

  async renew(id: string) {
    const membership = await this.prisma.membership.findUnique({ where: { id } });
    if (!membership) throw new NotFoundException('Članstvo nije pronađeno');
    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestException('Samo aktivno članstvo se može obnoviti');
    }
    const base = membership.endDate && membership.endDate > new Date() ? membership.endDate : new Date();
    const endDate = new Date(base.getTime() + 365 * 24 * 60 * 60 * 1000);
    return this.prisma.membership.update({
      where: { id },
      data: { endDate, status: MembershipStatus.ACTIVE },
      include: { card: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.membership.findUnique({
      where: { id },
      include: includeWithUser,
    });
    if (!item) throw new NotFoundException('Članstvo nije pronađeno');
    return resolveExpiredOne(this.prisma, item);
  }

  suspend(id: string) {
    return this.prisma.membership.update({
      where: { id },
      data: { status: MembershipStatus.SUSPENDED },
      include: { card: true },
    });
  }

  cancel(id: string) {
    return this.prisma.membership.update({
      where: { id },
      data: { status: MembershipStatus.CANCELLED },
      include: { card: true },
    });
  }

  private async assertNoPendingOrActive(
    userId: string,
    message = 'Korisnik već ima aktivno ili čekajuće članstvo',
  ) {
    const existing = await this.prisma.membership.findFirst({
      where: {
        userId,
        status: { in: [MembershipStatus.PENDING, MembershipStatus.ACTIVE] },
      },
    });
    if (existing) throw new BadRequestException(message);
  }
}
