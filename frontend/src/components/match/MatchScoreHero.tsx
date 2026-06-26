import type { Club } from '../../types';
import { ClubCrest } from '../public/clubs/ClubCrest';
import { ClubLink } from '../public/clubs/ClubLink';
import { PremiumCard } from '../public/shell/PremiumCard';
import { cn } from '../../lib/utils';

interface Props {
  homeClub?: Club | null;
  awayClub?: Club | null;
  homeScore?: number | null;
  awayScore?: number | null;
  meta?: string;
  live?: boolean;
  className?: string;
}

export function MatchScoreHero({
  homeClub,
  awayClub,
  homeScore,
  awayScore,
  meta,
  live,
  className,
}: Props) {
  return (
    <PremiumCard className={cn('p-6 text-center sm:p-10', className)} hover={false}>
      {live && (
        <span className="mb-4 inline-block rounded-full bg-danger/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-danger animate-pulse-soft">
          Uživo
        </span>
      )}
      {meta && <p className="text-sm text-text-muted">{meta}</p>}
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
        <div className="flex flex-col items-center gap-2 sm:flex-1 sm:items-end">
          <ClubCrest club={homeClub} size="md" />
          {homeClub?.slug ? (
            <ClubLink slug={homeClub.slug} name={homeClub.name} className="text-center text-lg sm:text-right" />
          ) : (
            <p className="text-lg font-bold">{homeClub?.name}</p>
          )}
        </div>
        <p className="font-display text-4xl font-bold tabular-nums text-primary sm:text-5xl">
          {homeScore ?? 0} : {awayScore ?? 0}
        </p>
        <div className="flex flex-col items-center gap-2 sm:flex-1 sm:items-start">
          <ClubCrest club={awayClub} size="md" />
          {awayClub?.slug ? (
            <ClubLink slug={awayClub.slug} name={awayClub.name} className="text-center text-lg sm:text-left" />
          ) : (
            <p className="text-lg font-bold">{awayClub?.name}</p>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}
