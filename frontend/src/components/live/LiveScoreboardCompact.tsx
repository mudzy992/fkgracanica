import { ClubCrest } from '../public/clubs/ClubCrest';
import { formatLiveMinute } from '../../lib/live-clock';
import type { LiveClockState } from '../../lib/live-clock';
import { isPenaltiesPhase } from '../../lib/match-live-phase';
import type { Match } from '../../types';

interface Props {
  match: Match;
  clock: LiveClockState | null;
  onToggle: () => void;
}

const crestClass = 'bg-white/10 text-white';

export function LiveScoreboardCompact({ match, clock, onToggle }: Props) {
  const isHalftime = match.status === 'HALFTIME';
  const penalties = isPenaltiesPhase(match);
  const minute = penalties ? 'PEN' : isHalftime ? 'PAUZA' : formatLiveMinute(clock, match.minute);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
      className="pointer-events-auto w-[min(100%,23rem)] cursor-pointer rounded-lg border border-white/10 bg-black/80 shadow-xl backdrop-blur-md sm:w-96 landscape:w-[21rem] landscape:rounded-md"
    >
      <div className="flex items-center gap-2 px-3 py-[0.38rem] landscape:gap-1.5 landscape:px-2.5 landscape:py-[0.36rem]">
        <ClubCrest club={match.awayClub} size="sm" className={crestClass} />
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white landscape:text-xs">
          {match.awayClub?.name ?? 'Gost'}
        </p>
        <div className="shrink-0 text-center">
          <p className="font-display text-2xl font-bold tabular-nums text-white landscape:text-xl">
            {match.awayScore}
            <span className="mx-0.5 text-white/50">-</span>
            {match.homeScore}
          </p>
          <p className="font-mono text-base tabular-nums text-amber-300 landscape:text-sm">{minute}</p>
          {penalties && (
            <p className="font-mono text-[10px] tabular-nums text-amber-300/80">
              pen {match.penaltyAwayScore ?? 0}:{match.penaltyHomeScore ?? 0}
            </p>
          )}
        </div>
        <p className="min-w-0 flex-1 truncate text-right text-sm font-semibold text-white landscape:text-xs">
          {match.homeClub?.name ?? 'Domaćin'}
        </p>
        <ClubCrest club={match.homeClub} size="sm" className={crestClass} />
      </div>
    </div>
  );
}
