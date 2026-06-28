import { useMemo } from 'react';
import { buildLiveStatsFeed } from '../../lib/live-stats-feed';
import { useLiveStatsPopup } from '../../hooks/use-live-stats-popup';
import type { Match } from '../../types';
import { LiveStatsComparisonCard } from './LiveStatsComparisonCard';
import { LiveStatsPlayerListCard } from './LiveStatsPlayerListCard';

interface Props {
  match: Match;
}

export function LiveStatsCorner({ match }: Props) {
  const items = useMemo(
    () => buildLiveStatsFeed(match),
    [match.events, match.homeClubId, match.awayClubId, match.homeClub?.name, match.awayClub?.name],
  );
  const { visible, active } = useLiveStatsPopup(items);

  if (!active || !visible) return null;

  return (
    <div className="absolute bottom-4 left-4 z-20 max-w-[min(92vw,24rem)] landscape:bottom-3 landscape:left-3 landscape:max-w-[20rem]">
      {active.kind === 'player-list' ? (
        <LiveStatsPlayerListCard stat={active} />
      ) : (
        <LiveStatsComparisonCard stat={active} />
      )}
    </div>
  );
}
