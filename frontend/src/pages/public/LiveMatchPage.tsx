import { Link, useParams } from 'react-router-dom';
import { LiveStreamBroadcast } from '../../components/live/LiveStreamBroadcast';
import { LiveCenterShell } from '../../components/live/LiveCenterShell';
import { LivePreMatchShell } from '../../components/live/LivePreMatchShell';
import { useMatch, usePublicSettings } from '../../hooks';
import { useMatchRealtime } from '../../hooks/use-match-realtime';
import { useLiveClock } from '../../hooks/use-live-clock';
import { matchShareDescription, matchShareImage, matchShareTitle } from '../../lib/match-seo';
import type { Match } from '../../types';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';

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
        <p>Utakmica nije pronađena.</p>
        <Link to="/liga" className="text-sm text-amber-300 hover:underline">Natrag na ligu</Link>
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
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-950 p-8 text-center text-white">
      <LiveMatchSeo match={data} />
      <p className="text-lg text-white/70">Utakmica trenutno nije uživo.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to={`/utakmice/${data.id}`} className="rounded-full bg-white/10 px-5 py-2 text-sm hover:bg-white/20">
          Detalji utakmice
        </Link>
        <Link to="/liga" className="rounded-full bg-white/10 px-5 py-2 text-sm hover:bg-white/20">
          Liga
        </Link>
      </div>
    </div>
  );
}
