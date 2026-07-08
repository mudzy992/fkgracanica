import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublicSettings, useSponsors } from '../../hooks';
import { useTicketingPublicConfig } from '../../hooks/use-ticketing';
import { useClubSquad } from '../../hooks/use-club-hub';
import { matchLineupToPitchSlots } from '../../lib/match-lineup-pitch';
import { SponsorsMarquee } from '../public/sponsors/SponsorsMarquee';
import { ResponsiveFormationPitch } from '../public/clubs/ResponsiveFormationPitch';
import { ClubCrest } from '../public/clubs/ClubCrest';
import { LivePrematchAudio } from './LivePrematchAudio';
import type { Match } from '../../types';

interface Props {
  match: Match;
}

function useCountdown(scheduledAt: string) {
  const target = useMemo(() => new Date(scheduledAt).getTime(), [scheduledAt]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { h, m, s, started: diff <= 0 };
}

export function LivePreMatchShell({ match }: Props) {
  const { data: sponsors, isLoading: sponsorsLoading } = useSponsors();
  const { data: settings } = usePublicSettings();
  const { data: ticketing } = useTicketingPublicConfig();
  const audioUrl = settings?.['live.prematchAudioUrl'] ?? '';
  const lineup = match.lineup ?? match.lineups ?? [];
  const { data: homeSquad } = useClubSquad(match.homeClubId);
  const { data: awaySquad } = useClubSquad(match.awayClubId);
  const homeSlots = matchLineupToPitchSlots(lineup, match.homeClubId, homeSquad?.slots);
  const awaySlots = matchLineupToPitchSlots(lineup, match.awayClubId, awaySquad?.slots);
  const [showAway, setShowAway] = useState(false);
  const countdown = useCountdown(match.scheduledAt);
  const list = sponsors ?? [];
  const half = list.slice(0, Math.ceil(list.length / 2));
  const rest = list.slice(Math.ceil(list.length / 2));

  useEffect(() => {
    if (!homeSlots.length && !awaySlots.length) return;
    const id = window.setInterval(() => setShowAway((v) => !v), 12_000);
    return () => window.clearInterval(id);
  }, [homeSlots.length, awaySlots.length]);

  const activeSlots = showAway && awaySlots.length ? awaySlots : homeSlots;
  const activeClub = showAway && awaySlots.length ? match.awayClub : match.homeClub;
  const ticketingOn = settings?.['modules.ticketing'] !== 'false' && ticketing?.modulesTicketing !== false;
  const sales = ticketing?.salesModes;
  const showTicketsCta =
    match.homeClub?.isOwnClub &&
    match.status === 'SCHEDULED' &&
    ticketingOn &&
    (sales?.boxOffice || sales?.online);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-6 text-white sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,102,255,0.14),transparent_55%)]" />
      <LivePrematchAudio url={audioUrl} active={!!audioUrl} />

      <div className="relative mx-auto w-full max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Uskoro uživo
        </span>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-4 py-8 backdrop-blur-sm sm:px-8 sm:py-10">
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <ClubCrest club={match.homeClub} size="md" />
              <span className="truncate text-sm font-semibold">{match.homeClub?.name}</span>
            </div>
            <div className="font-display text-2xl font-bold text-white/45 sm:text-3xl">vs</div>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <ClubCrest club={match.awayClub} size="md" />
              <span className="truncate text-sm font-semibold">{match.awayClub?.name}</span>
            </div>
          </div>
          {!countdown.started ? (
            <div className="mt-8 font-mono text-4xl font-bold tabular-nums tracking-tight text-amber-300 sm:text-5xl">
              {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:
              {String(countdown.s).padStart(2, '0')}
            </div>
          ) : (
            <p className="mt-8 text-sm font-medium text-amber-300">Utakmica uskoro počinje…</p>
          )}
        </div>
      </div>

      {activeSlots.length > 0 && (
        <section className="relative mx-auto mt-8 w-full max-w-xl sm:max-w-2xl">
          <div className="border-gradient-club glass-premium overflow-hidden rounded-3xl p-4 sm:p-6 md:p-7">
            <h2 className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55 sm:text-[11px]">
              Postava — {activeClub?.name}
            </h2>
            <ResponsiveFormationPitch
              slots={activeSlots}
              premium
              enlarged
              compact
              crestFallback={activeClub}
            />
          </div>
        </section>
      )}

      <section className="relative mx-auto mt-8 w-full max-w-3xl flex-1">
        <h2 className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300/80">
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

      <div className="relative mx-auto mt-8 flex flex-wrap justify-center gap-3">
        {showTicketsCta && (
          <Link
            to={`/ulaznice?matchId=${match.id}`}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Kupi ulaznice
          </Link>
        )}
        <Link
          to={`/utakmice/${match.id}`}
          className="rounded-full bg-white/10 px-5 py-2.5 text-sm hover:bg-white/20"
        >
          Detalji utakmice
        </Link>
        <Link to="/liga" className="rounded-full bg-white/10 px-5 py-2.5 text-sm hover:bg-white/20">
          Liga
        </Link>
      </div>
    </div>
  );
}
