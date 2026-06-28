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

export function LiveScoreboardExpanded({ match, clock, onToggle }: Props) {
  const isHalftime = match.status === 'HALFTIME';
  const penalties = isPenaltiesPhase(match);
  const minute = penalties ? 'PEN' : isHalftime ? 'PAUZA' : formatLiveMinute(clock, match.minute);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
      className="pointer-events-auto w-[min(100%,40rem)] cursor-pointer rounded-xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-md sm:w-[40rem] landscape:max-w-[32rem]"
    >
      <div className="flex items-center gap-3 px-4 py-[0.41rem] landscape:px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <ClubCrest club={match.awayClub} size="md" className={crestClass} />
          <p className="truncate text-base font-semibold text-white landscape:text-sm">
            {match.awayClub?.name ?? 'Gost'}
          </p>
        </div>
        <div className="shrink-0 text-center">
          <p className="font-display text-4xl font-bold tabular-nums text-white landscape:text-3xl">
            {match.awayScore}
            <span className="mx-1 text-white/50">:</span>
            {match.homeScore}
          </p>
          <p className="font-mono text-lg tabular-nums text-amber-300 landscape:text-base">{minute}</p>
          {penalties && (
            <p className="font-mono text-xs tabular-nums text-amber-300/80">
              ({match.penaltyAwayScore ?? 0}:{match.penaltyHomeScore ?? 0} pen)
            </p>
          )}
          {clock && match.status === 'LIVE' && !penalties && (
            <p className="text-xs text-white/50">{clock.periodLabel}</p>
          )}
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <p className="truncate text-right text-base font-semibold text-white landscape:text-sm">
            {match.homeClub?.name ?? 'Domaćin'}
          </p>
          <ClubCrest club={match.homeClub} size="md" className={crestClass} />
        </div>
      </div>
    </div>
  );
}
