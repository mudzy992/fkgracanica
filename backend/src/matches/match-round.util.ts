import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

export type ResolvedRound = { roundId: string | null };

export async function resolveMatchRoundFields(
  prisma: Pick<PrismaService, 'round'>,
  roundId?: string | null,
): Promise<ResolvedRound | Record<string, never>> {
  if (roundId === undefined) return {};
  if (roundId === null || roundId === '') return { roundId: null };
  const round = await prisma.round.findUnique({ where: { id: roundId } });
  if (!round) throw new BadRequestException('Kolo nije pronađeno.');
  return { roundId: round.id };
}

export function isResolvedRound(
  v: ResolvedRound | Record<string, never>,
): v is ResolvedRound {
  return 'roundId' in v;
}

/** Prisma MatchUpdateInput uses roundRel, not scalar roundId. */
export function roundToMatchUpdateInput(
  resolved: ResolvedRound | Record<string, never>,
): Prisma.MatchUpdateInput {
  if (!isResolvedRound(resolved)) return {};
  if (resolved.roundId === null) {
    return { roundRel: { disconnect: true } };
  }
  return { roundRel: { connect: { id: resolved.roundId } } };
}

export function roundToMatchCreateInput(
  resolved: ResolvedRound | Record<string, never>,
): { roundId?: string | null } {
  if (!isResolvedRound(resolved)) return {};
  return { roundId: resolved.roundId };
}

export function assertDistinctClubs(homeClubId: string, awayClubId: string) {
  if (homeClubId === awayClubId) {
    throw new BadRequestException('Domaći i gosti ne mogu biti isti klub.');
  }
}
