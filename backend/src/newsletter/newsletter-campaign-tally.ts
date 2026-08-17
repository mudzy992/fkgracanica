import type { PrismaService } from '../prisma/prisma.service';
import { campaignFinalStatus } from './newsletter-campaign.util';

export type CampaignTallySnapshot = {
  id: string;
  status: string;
  sentCount: number;
  failCount: number;
  targetCount: number;
};

export async function tallyCampaignEmail(
  prisma: PrismaService,
  campaignId: string | undefined,
  ok: boolean,
): Promise<CampaignTallySnapshot | null> {
  if (!campaignId) return null;
  const row = await prisma.newsletterCampaign.update({
    where: { id: campaignId },
    data: ok ? { sentCount: { increment: 1 } } : { failCount: { increment: 1 } },
  });
  if (row.status !== 'SENDING') {
    return {
      id: row.id,
      status: row.status,
      sentCount: row.sentCount,
      failCount: row.failCount,
      targetCount: row.targetCount,
    };
  }
  const next = campaignFinalStatus(row.sentCount, row.failCount, row.targetCount);
  if (!next) {
    return {
      id: row.id,
      status: row.status,
      sentCount: row.sentCount,
      failCount: row.failCount,
      targetCount: row.targetCount,
    };
  }
  const done = await prisma.newsletterCampaign.update({
    where: { id: campaignId },
    data: { status: next, sentAt: new Date() },
  });
  return {
    id: done.id,
    status: done.status,
    sentCount: done.sentCount,
    failCount: done.failCount,
    targetCount: done.targetCount,
  };
}
