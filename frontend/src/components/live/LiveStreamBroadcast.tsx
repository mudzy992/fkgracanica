import { Link } from 'react-router-dom';
import { useLiveClock } from '../../hooks/use-live-clock';
import type { Match } from '../../types';
import { LiveYouTubePlayer } from './LiveYouTubePlayer';
import { LiveScoreboardOverlay } from './LiveScoreboardOverlay';
import { LiveHalftimePanel } from './LiveHalftimePanel';
import { LiveStatsCorner } from './LiveStatsCorner';
import { LiveEventToast, useLiveEventToasts } from './use-live-event-toasts';

interface Props {
  match: Match;
}

export function LiveStreamBroadcast({ match }: Props) {
  const clock = useLiveClock(match);
  const toast = useLiveEventToasts(match.events);
  const streamUrl = match.liveStreamUrl ?? match.youtubeUrl;
  const isHalftime = match.status === 'HALFTIME';

  return (
    <div className="relative min-h-[100dvh] w-full bg-black">
      {streamUrl && (
        <LiveYouTubePlayer url={streamUrl} active={!isHalftime} hidden={isHalftime} />
      )}
      {isHalftime && <LiveHalftimePanel match={match} />}
      {!isHalftime && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
          <LiveScoreboardOverlay match={match} clock={clock} />
          <LiveStatsCorner match={match} />
          {toast && (
            <div className="absolute inset-x-0 bottom-24 z-30 flex justify-center px-4 landscape:bottom-16">
              <LiveEventToast event={toast} />
            </div>
          )}
        </>
      )}
      <div className="pointer-events-auto absolute bottom-4 right-4 z-20 landscape:bottom-3 landscape:right-3">
        <Link
          to={`/utakmice/${match.id}`}
          className="rounded-full bg-white/15 px-3 py-1.5 text-xs text-white backdrop-blur hover:bg-white/25 sm:px-4 sm:py-2 sm:text-sm"
        >
          Utakmica
        </Link>
      </div>
    </div>
  );
}
