import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.module';
import type { CreateNewsletterCampaignDto } from './dto/create-newsletter-campaign.dto';
import { newsletterPublicOrigin, unsubscribeUrl } from './newsletter-campaign.util';
import { renderNewsletterHtml } from './newsletter-email.template';
import { mediaPublicUrl } from '../seo/seo-url.util';

@Injectable()
export class NewsletterCampaignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobsService,
  ) {}

  list() {
    return this.prisma.newsletterCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { createdBy: { select: { email: true } } },
    });
  }

  async preview(dto: CreateNewsletterCampaignDto) {
    const brand = await this.brand();
    return { html: this.render(dto, brand, unsubscribeUrl(newsletterPublicOrigin(), 'preview')) };
  }

  async create(dto: CreateNewsletterCampaignDto, userId: string) {
    const textBody = dto.textBody.trim();
    const brand = await this.brand();
    const htmlBody = this.render(dto, brand, unsubscribeUrl(newsletterPublicOrigin(), 'preview'));
    return this.prisma.newsletterCampaign.create({
      data: {
        subject: dto.subject.trim(),
        textBody,
        htmlBody,
        ctaLabel: dto.ctaLabel?.trim() || null,
        ctaUrl: dto.ctaUrl?.trim() || null,
        createdById: userId,
      },
    });
  }

  async send(id: string) {
    await this.assertBlastEnabled();
    const campaign = await this.prisma.newsletterCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Kampanja nije pronađena');
    if (campaign.status !== 'DRAFT') {
      throw new BadRequestException('Samo nacrt se može poslati');
    }
    const subs = await this.prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true, unsubscribeToken: true },
    });
    if (!subs.length) throw new BadRequestException('Nema aktivnih pretplatnika');

    await this.prisma.newsletterCampaign.update({
      where: { id },
      data: { status: 'SENDING', targetCount: subs.length, sentCount: 0, failCount: 0 },
    });

    const origin = newsletterPublicOrigin();
    const brand = await this.brand();
    const dto = {
      subject: campaign.subject,
      textBody: campaign.textBody,
      ctaLabel: campaign.ctaLabel ?? undefined,
      ctaUrl: campaign.ctaUrl ?? undefined,
    };
    for (const sub of subs) {
      this.jobs.enqueueEmailLater({
        to: sub.email,
        subject: campaign.subject,
        body: campaign.textBody,
        html: this.render(dto, brand, unsubscribeUrl(origin, sub.unsubscribeToken)),
        campaignId: id,
      });
    }
    return this.prisma.newsletterCampaign.findUniqueOrThrow({ where: { id } });
  }

  private render(
    dto: CreateNewsletterCampaignDto,
    brand: { clubName: string; crestUrl?: string },
    unsub: string,
  ) {
    return renderNewsletterHtml({
      clubName: brand.clubName,
      crestUrl: brand.crestUrl,
      subject: dto.subject.trim(),
      textBody: dto.textBody.trim(),
      ctaLabel: dto.ctaLabel,
      ctaUrl: dto.ctaUrl,
      unsubscribeUrl: unsub,
    });
  }

  private async brand() {
    const rows = await this.prisma.setting.findMany({
      where: { key: { in: ['club.name', 'club.crestUrl'] } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      clubName: map['club.name']?.trim() || 'FK Gračanica',
      crestUrl: mediaPublicUrl(map['club.crestUrl'] || null, 'medium'),
    };
  }

  private async assertBlastEnabled() {
    const row = await this.prisma.setting.findUnique({
      where: { key: 'newsletter.blastEnabled' },
    });
    if (row?.value !== 'true' && row?.value !== '1') {
      throw new BadRequestException('Slanje kampanja je isključeno (newsletter.blastEnabled)');
    }
  }
}
