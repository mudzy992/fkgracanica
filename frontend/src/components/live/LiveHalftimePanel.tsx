import { useMatchStatistics, usePublicSettings, useSponsors } from '../../hooks';
import { SponsorsMarquee } from '../public/sponsors/SponsorsMarquee';
import { ClubCrest } from '../public/clubs/ClubCrest';
import type { Match } from '../../types';
import { LiveHalftimeStats } from './LiveHalftimeStats';
import { LivePrematchAudio } from './LivePrematchAudio';

interface Props {
  match: Match;
  compact?: boolean;
}

function breakTitle(liveBreak: Match['liveBreak']) {
  if (liveBreak === 'ET_HT') return 'Pauza produžetaka';
  if (liveBreak === 'POST_REGULATION') return 'Neriješeno — čeka se odluka';
  if (liveBreak === 'POST_EXTRA') return 'Neriješeno — penali uskoro';
  return 'Poluvrijeme';
}

function showHalftimeStats(liveBreak: Match['liveBreak']) {
  return liveBreak === 'REGULAR_HT' || liveBreak === 'ET_HT' || !liveBreak || liveBreak === 'NONE';
}

export function LiveHalftimePanel({ match, compact }: Props) {
  const liveBreak = match.liveBreak ?? 'REGULAR_HT';
  const { data: settings } = usePublicSettings();
  const audioUrl = settings?.['live.prematchAudioUrl'] ?? '';
  const { data: sponsors, isLoading: sponsorsLoading } = useSponsors();
  const { data: stats, isLoading: statsLoading } = useMatchStatistics(
    showHalftimeStats(liveBreak) ? match.id : undefined,
  );
  const list = sponsors ?? [];
  const half = list.slice(0, Math.ceil(list.length / 2));
  const rest = list.slice(Math.ceil(list.length / 2));

  return (
    <div
      className={
        compact
          ? 'space-y-6'
          : 'absolute inset-0 z-10 flex flex-col overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-6 sm:px-8 sm:py-10'
      }
    >
      <LivePrematchAudio url={audioUrl} active={!!audioUrl} />
      {!compact && (
        <div className="mx-auto w-full max-w-3xl text-center">
          <span className="rounded bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-black">
            {breakTitle(liveBreak)}
          </span>
          <div className="mt-6 flex items-center justify-center gap-4 sm:gap-8">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <ClubCrest club={match.homeClub} size="md" />
              <span className="truncate text-sm font-semibold text-white">{match.homeClub?.name}</span>
            </div>
            <div className="font-display text-4xl font-bold tabular-nums text-white sm:text-5xl">
              {match.homeScore}<span className="mx-1 text-white/40">:</span>{match.awayScore}
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <ClubCrest club={match.awayClub} size="md" />
              <span className="truncate text-sm font-semibold text-white">{match.awayClub?.name}</span>
            </div>
          </div>
        </div>
      )}

      <div className={compact ? '' : 'mx-auto w-full max-w-3xl flex-1 space-y-8'}>
        <section>
          <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/80">
            Naši partneri
          </h2>
          {sponsorsLoading ? (
            <div className="h-24 animate-pulse rounded-xl bg-white/5" />
          ) : list.length ? (
            <div className="space-y-3">
              <SponsorsMarquee sponsors={half} />
              {rest.length > 0 && <SponsorsMarquee sponsors={rest} reverse />}
            </div>
          ) : (
            <p className="text-center text-sm text-white/40">Nema sponzora.</p>
          )}
        </section>

        {showHalftimeStats(liveBreak) && (
        <section>
          <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            {liveBreak === 'ET_HT' ? 'Statistika — produžeci' : 'Statistika — 1. poluvrijeme'}
          </h2>
          <LiveHalftimeStats match={match} stats={stats} loading={statsLoading} />
        </section>
        )}
      </div>
    </div>
  );
}
