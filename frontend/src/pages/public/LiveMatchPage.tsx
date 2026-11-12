import { Link, useParams } from 'react-router-dom';
import { LiveStreamBroadcast } from '../../components/live/LiveStreamBroadcast';
import { LiveCenterShell } from '../../components/live/LiveCenterShell';
import { LivePreMatchShell } from '../../components/live/LivePreMatchShell';
import { useMatch, usePublicSettings } from '../../hooks';
import { useMatchRealtime } from '../../hooks/use-match-realtime';
import { useLiveClock } from '../../hooks/use-live-clock';
import { matchShareDescription, matchShareImage, matchShareTitle } from '../../lib/match-seo';
import { matchStatusLabel } from '../../lib/match-status-label';
import type { Match } from '../../types';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';
import { ClubCrest } from '../../components/public/clubs/ClubCrest';
import { useTranslation } from 'react-i18next';

function LiveMatchSeo({
  match,
  live,
  scheduled,
}: {
  match: Match;
  live?: boolean;
  scheduled?: boolean;
}) {
  const { data: settings } = usePublicSettings();
  const title = scheduled
    ? `${matchShareTitle(match)} — Uskoro`
    : `${matchShareTitle(match, live)}`;

  return (
    <Seo
      title={title}
      description={matchShareDescription(match, live)}
      image={matchShareImage(match, settings?.['club.crestUrl'])}
      url={`/live/${match.id}`}
      type="article"
    />
  );
}

export function LiveMatchPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useMatch(id ?? '');
  useMatchRealtime(id);
  const clock = useLiveClock(data);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black">
        <Skeleton className="h-96 w-full max-w-3xl bg-white/10" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-950 p-8 text-white">
        <p className="text-white/80">{t('pages.live.notFound')}</p>
        <Link to="/liga" className="text-sm text-amber-300 hover:underline">
          {t('pages.live.backToLeague')}
        </Link>
      </div>
    );
  }

  const isLive = data.status === 'LIVE' || data.status === 'HALFTIME';
  const isScheduled = data.status === 'SCHEDULED';
  const showBroadcast = !!(data.liveStreamUrl && isLive);

  if (isScheduled) {
    return (
      <>
        <LiveMatchSeo match={data} scheduled />
        <LivePreMatchShell match={data} />
      </>
    );
  }

  if (showBroadcast) {
    return (
      <>
        <LiveMatchSeo match={data} live />
        <LiveStreamBroadcast match={data} />
      </>
    );
  }

  if (isLive) {
    return (
      <>
        <LiveMatchSeo match={data} live />
        <LiveCenterShell match={data} clock={clock} />
      </>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 bg-gradient-to-b from-slate-950 via-slate-900 to-black p-8 text-center text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,102,255,0.12),transparent_55%)]" />
      <LiveMatchSeo match={data} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-10 backdrop-blur-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">
          {matchStatusLabel(data.status)}
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <ClubCrest club={data.homeClub} size="sm" />
          <span className="font-display text-2xl font-bold tabular-nums">
            {data.homeScore ?? 0}:{data.awayScore ?? 0}
          </span>
          <ClubCrest club={data.awayClub} size="sm" />
        </div>
        <p className="mt-4 text-sm text-white/80">
          {data.homeClub?.name} — {data.awayClub?.name}
        </p>
        <p className="mt-2 text-sm text-white/40">{t('pages.live.notLive')}</p>
      </div>
      <div className="relative flex flex-wrap justify-center gap-3">
        <Link
          to={`/utakmice/${data.id}`}
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
