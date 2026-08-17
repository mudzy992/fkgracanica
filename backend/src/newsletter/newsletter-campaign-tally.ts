import type { PrismaService } from '../prisma/prisma.service';
import { campaignFinalStatus } from './newsletter-campaign.util';

export async function tallyCampaignEmail(
  prisma: PrismaService,
  campaignId: string | undefined,
  ok: boolean,
) {
  if (!campaignId) return;
  const row = await prisma.newsletterCampaign.update({
    where: { id: campaignId },
    data: ok ? { sentCount: { increment: 1 } } : { failCount: { increment: 1 } },
  });
  if (row.status !== 'SENDING') return;
  const next = campaignFinalStatus(row.sentCount, row.failCount, row.targetCount);
  if (!next) return;
  await prisma.newsletterCampaign.update({
    where: { id: campaignId },
    data: { status: next, sentAt: new Date() },
  });
}
