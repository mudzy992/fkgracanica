import { BadRequestException } from '@nestjs/common';
import { MatchReportStatus, MatchStatus } from '@prisma/client';

type RetrospectiveMatch = {
  status: MatchStatus;
  clockStartedAt: Date | null;
  reportStatus: MatchReportStatus;
};

export function isRetrospectiveMatch(match: RetrospectiveMatch): boolean {
  return (
    match.status === MatchStatus.FINISHED &&
    match.clockStartedAt === null &&
    match.reportStatus !== MatchReportStatus.APPROVED
  );
}

const PAST_TOLERANCE_MS = 60_000;

export function assertFinishedResult(data: {
  scheduledAt: string | Date;
  homeScore?: number;
  awayScore?: number;
}) {
  const scheduled = new Date(data.scheduledAt);
  if (Number.isNaN(scheduled.getTime())) {
    throw new BadRequestException('Datum utakmice nije ispravan.');
  }
  const cutoff = Date.now() - PAST_TOLERANCE_MS;
  if (scheduled.getTime() >= cutoff) {
    throw new BadRequestException('Retroaktivna utakmica mora imati datum u prošlosti.');
  }
  if (data.homeScore == null || data.awayScore == null) {
    throw new BadRequestException('Za završenu utakmicu u prošlosti unesite rezultat.');
  }
  if (data.homeScore < 0 || data.awayScore < 0) {
    throw new BadRequestException('Rezultat ne može biti negativan.');
  }
}

export function assertRetrospectiveCreate(data: {
  status?: MatchStatus;
  scheduledAt: string | Date;
  homeScore?: number;
  awayScore?: number;
}) {
  if (data.status !== MatchStatus.FINISHED) return;
  assertFinishedResult(data);
}

export function assertManualFinish(data: {
  nextStatus?: MatchStatus;
  existingStatus: MatchStatus;
  scheduledAt: string | Date;
  homeScore?: number;
  awayScore?: number;
}) {
  if (data.nextStatus !== MatchStatus.FINISHED) return;
  if (data.existingStatus === MatchStatus.FINISHED) return;
  if (
    data.existingStatus !== MatchStatus.SCHEDULED &&
    data.existingStatus !== MatchStatus.POSTPONED
  ) {
    throw new BadRequestException('Utakmicu u toku završava komentator.');
  }
  assertFinishedResult({
    scheduledAt: data.scheduledAt,
    homeScore: data.homeScore,
    awayScore: data.awayScore,
  });
}
