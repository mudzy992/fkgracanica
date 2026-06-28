import { MatchStatBar } from '../match/MatchStatBar';
import type { Match } from '../../types';
import type { MatchStatisticsOverview } from '../../types/match-stats';

function hasTeamStats(home: MatchStatisticsOverview['team']['home'], away: MatchStatisticsOverview['team']['away']) {
  return (
    home.shots + away.shots + home.corners + away.corners + home.fouls + away.fouls
    + home.yellowCards + away.yellowCards + home.redCards + away.redCards > 0
    || home.goals + away.goals > 0
  );
}

interface Props {
  match: Match;
  stats?: MatchStatisticsOverview;
  loading?: boolean;
}

export function LiveHalftimeStats({ match, stats, loading }: Props) {
  if (loading) {
    return <div className="h-40 animate-pulse rounded-xl bg-white/5" />;
  }
  if (!stats || !hasTeamStats(stats.team.home, stats.team.away)) {
    return <p className="text-center text-sm text-white/40">Statistika 1. poluvremena nije dostupna.</p>;
  }

  const { home, away } = stats.team;
  const homeName = match.homeClub?.name ?? 'Domaći';
  const awayName = match.awayClub?.name ?? 'Gosti';

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5">
      <div className="grid grid-cols-3 text-xs font-medium text-white/60">
        <span className="truncate text-right">{homeName}</span>
        <span className="text-center">1. poluvrijeme</span>
        <span className="truncate">{awayName}</span>
      </div>
      <MatchStatBar label="Golovi" home={home.goals} away={away.goals} dark />
      <MatchStatBar label="Udarci" home={home.shots} away={away.shots} dark />
      <MatchStatBar label="U okvir" home={home.shotsOn} away={away.shotsOn} dark />
      <MatchStatBar label="Korneri" home={home.corners} away={away.corners} dark />
      <MatchStatBar label="Prekršaji" home={home.fouls} away={away.fouls} dark />
      <MatchStatBar label="Žuti" home={home.yellowCards} away={away.yellowCards} dark />
      {(home.redCards > 0 || away.redCards > 0) && (
        <MatchStatBar label="Crveni" home={home.redCards} away={away.redCards} dark />
      )}
    </div>
  );
}
