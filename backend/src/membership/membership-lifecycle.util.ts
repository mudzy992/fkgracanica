import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MembershipStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

export const PAYABLE_STATUSES: MembershipStatus[] = [
  MembershipStatus.PENDING,
  MembershipStatus.ACTIVE,
  MembershipStatus.EXPIRED,
  MembershipStatus.CANCELLED,
];

export const ACTIVATABLE_STATUSES: MembershipStatus[] = [
  MembershipStatus.PENDING,
  MembershipStatus.SUSPENDED,
  MembershipStatus.EXPIRED,
  MembershipStatus.CANCELLED,
];

export const RENEWABLE_STATUSES: MembershipStatus[] = [
  MembershipStatus.ACTIVE,
  MembershipStatus.EXPIRED,
];

export const CONFIRMABLE_STATUSES: MembershipStatus[] = PAYABLE_STATUSES;

const REUSABLE_STATUSES: MembershipStatus[] = [
  MembershipStatus.CANCELLED,
  MembershipStatus.EXPIRED,
];

export function isPayable(status: MembershipStatus): boolean {
  return PAYABLE_STATUSES.includes(status);
}

export function isConfirmable(status: MembershipStatus): boolean {
  return CONFIRMABLE_STATUSES.includes(status);
}

function assertIn(
  status: MembershipStatus,
  allowed: MembershipStatus[],
  message: string,
) {
  if (!allowed.includes(status)) throw new BadRequestException(message);
}

export function assertCanActivate(status: MembershipStatus) {
  assertIn(status, ACTIVATABLE_STATUSES, 'Ovo članstvo se ne može aktivirati');
}

export function assertCanRenew(status: MembershipStatus) {
  assertIn(
    status,
    RENEWABLE_STATUSES,
    'Samo aktivno ili isteklo članstvo se može obnoviti',
  );
}

export function assertCanSuspend(status: MembershipStatus) {
  assertIn(
    status,
    [MembershipStatus.ACTIVE],
    'Samo aktivno članstvo se može suspendovati',
  );
}

export function assertCanCancel(status: MembershipStatus) {
  if (status === MembershipStatus.CANCELLED) {
    throw new BadRequestException('Članstvo je već otkazano');
  }
}

export async function requireMembership(prisma: PrismaService, id: string) {
  const membership = await prisma.membership.findUnique({ where: { id } });
  if (!membership) throw new NotFoundException('Članstvo nije pronađeno');
  return membership;
}

export async function assertNoPendingOrActive(
  prisma: PrismaService,
  userId: string,
  message = 'Korisnik već ima aktivno ili čekajuće članstvo',
) {
  const existing = await prisma.membership.findFirst({
    where: {
      userId,
      status: { in: [MembershipStatus.PENDING, MembershipStatus.ACTIVE] },
    },
  });
  if (existing) throw new BadRequestException(message);
}

export async function openPendingMembership(
  prisma: PrismaService,
  userId: string,
  message?: string,
) {
  await assertNoPendingOrActive(prisma, userId, message);
  const reusable = await prisma.membership.findFirst({
    where: { userId, status: { in: REUSABLE_STATUSES } },
    orderBy: { createdAt: 'desc' },
  });
  if (reusable) {
    return prisma.membership.update({
      where: { id: reusable.id },
      data: { status: MembershipStatus.PENDING },
    });
  }
  return prisma.membership.create({
    data: { userId, status: MembershipStatus.PENDING },
  });
}
