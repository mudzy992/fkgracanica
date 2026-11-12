import { Link } from 'react-router-dom';
import { ClubCrest } from '../public/clubs/ClubCrest';
import { formatLiveMinute } from '../../lib/live-clock';
import type { LiveClockState } from '../../lib/live-clock';
import { matchEventLabel } from '../../lib/match-event-labels';
import { formatEventPlayers } from '../../lib/live-event-text';
import type { Match } from '../../types';
import { LiveEventToast, useLiveEventToasts } from './use-live-event-toasts';
import { LiveHalftimePanel } from './LiveHalftimePanel';

interface Props {
  match: Match;
  clock: LiveClockState | null;
}

export function LiveCenterShell({ match, clock }: Props) {
  const toast = useLiveEventToasts(match.events);
  const isHalftime = match.status === 'HALFTIME';
  const minute = isHalftime ? 'PAUZA' : formatLiveMinute(clock, match.minute);
  const events = [...(match.events ?? [])].reverse();

  return (
    <div className="relative flex min-h-dvh flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,102,255,0.12),transparent_50%)]" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <span className="font-display text-sm font-semibold tracking-wide sm:text-base">
            Live centar
          </span>
          <div className="flex items-center gap-2">
            {!isHalftime && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                Uživo
              </span>
            )}
            {isHalftime && (
              <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                Pauza
              </span>
            )}
            <span className="font-mono text-lg font-bold tabular-nums text-amber-300 sm:text-xl">
              {minute}
            </span>
          </div>
        </div>
        {clock && !isHalftime && (
          <p className="pb-2 text-center text-xs text-white/50">{clock.periodLabel}</p>
        )}
      </header>

      <main className="relative mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(0,102,255,0.15),transparent_70%)]" />
          <div className="relative flex items-center justify-center gap-4 sm:gap-8">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <ClubCrest club={match.homeClub} size="md" />
              <span className="truncate text-sm font-semibold sm:text-base">
                {match.homeClub?.name}
              </span>
            </div>
            <div className="shrink-0 font-display text-4xl font-bold tabular-nums sm:text-5xl">
              {match.homeScore}
              <span className="mx-1 text-white/40">:</span>
              {match.awayScore}
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <ClubCrest club={match.awayClub} size="md" />
              <span className="truncate text-sm font-semibold sm:text-base">
                {match.awayClub?.name}
              </span>
            </div>
          </div>
        </div>

        {isHalftime ? (
          <div className="mt-8">
            <LiveHalftimePanel match={match} compact />
          </div>
        ) : (
          <section className="mt-8">
            <h2 className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
              Događaji
            </h2>
            {events.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/15 py-10 text-center text-sm text-white/40">
                Još nema događaja
              </p>
            ) : (
              <ul className="space-y-2">
                {events.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm backdrop-blur-sm"
                  >
                    <span className="shrink-0 font-mono font-bold tabular-nums text-amber-300">
                      {ev.minute}&apos;
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{matchEventLabel(ev.type)}</p>
                      {formatEventPlayers(ev) && (
                        <p className="mt-0.5 text-white/80">{formatEventPlayers(ev)}</p>
                      )}
                      {ev.description && !formatEventPlayers(ev) && (
                        <p className="mt-0.5 text-white/80">{ev.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-4">
          <LiveEventToast event={toast} />
        </div>
      )}

      <footer className="sticky bottom-0 border-t border-white/10 bg-black/60 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl justify-center">
          <Link
            to={`/utakmice/${match.id}`}
            className="rounded-full bg-white/10 px-5 py-2 text-sm text-white/90 transition hover:bg-white/20"
          >
            Detalji utakmice
          </Link>
        </div>
      </footer>
    </div>
  );
}
