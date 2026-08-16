import { MembershipStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

export async function resolveExpiredMany<
  T extends { id: string; status: MembershipStatus; endDate: Date | null },
>(prisma: PrismaService, items: T[]): Promise<T[]> {
  const now = new Date();
  const expiredIds = items
    .filter((m) => m.status === MembershipStatus.ACTIVE && m.endDate && m.endDate < now)
    .map((m) => m.id);
  if (!expiredIds.length) return items;
  await prisma.membership.updateMany({
    where: { id: { in: expiredIds } },
    data: { status: MembershipStatus.EXPIRED },
  });
  return items.map((m) =>
    expiredIds.includes(m.id) ? { ...m, status: MembershipStatus.EXPIRED } : m,
  );
}

export async function resolveExpiredOne<
  T extends { id: string; status: MembershipStatus; endDate: Date | null },
>(prisma: PrismaService, item: T): Promise<T> {
  const [resolved] = await resolveExpiredMany(prisma, [item]);
  return resolved;
}
