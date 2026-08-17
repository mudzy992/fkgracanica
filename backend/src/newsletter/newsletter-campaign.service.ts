import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.module';
import type { CreateNewsletterCampaignDto } from './dto/create-newsletter-campaign.dto';
import {
  htmlToText,
  newsletterPublicOrigin,
  withUnsubscribeFooter,
} from './newsletter-campaign.util';

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

  create(dto: CreateNewsletterCampaignDto, userId: string) {
    return this.prisma.newsletterCampaign.create({
      data: {
        subject: dto.subject.trim(),
        htmlBody: dto.htmlBody,
        textBody: dto.textBody?.trim() || htmlToText(dto.htmlBody),
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
    for (const sub of subs) {
      this.jobs.enqueueEmailLater({
        to: sub.email,
        subject: campaign.subject,
        body: campaign.textBody,
        html: withUnsubscribeFooter(campaign.htmlBody, origin, sub.unsubscribeToken),
        campaignId: id,
      });
    }
    return this.prisma.newsletterCampaign.findUniqueOrThrow({ where: { id } });
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
