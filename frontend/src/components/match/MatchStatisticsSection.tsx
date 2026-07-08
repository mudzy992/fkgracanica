import { NewsSectionTitle } from '../news/NewsSectionTitle';
import { Reveal } from '../../lib/motion/Reveal';
import { MatchStatBar } from './MatchStatBar';
import { MatchPlayerStatsTable } from './MatchPlayerStatsTable';
import type { Match } from '../../types';
import type { MatchStatisticsOverview } from '../../types/match-stats';

function hasTeamStats(home: MatchStatisticsOverview['team']['home'], away: MatchStatisticsOverview['team']['away']) {
  const fields = [
    home.shots + away.shots,
    home.shotsOn + away.shotsOn,
    home.corners + away.corners,
    home.fouls + away.fouls,
    home.offsides + away.offsides,
    home.yellowCards + away.yellowCards,
    home.redCards + away.redCards,
    home.saves + away.saves,
    home.penaltiesScored + away.penaltiesScored,
    home.penaltiesMissed + away.penaltiesMissed,
    home.possession != null ? 1 : 0,
    home.goals + away.goals,
  ];
  return fields.some((v) => v > 0);
}

export function MatchStatisticsSection({
  match,
  stats,
  loading,
}: {
  match: Match;
  stats?: MatchStatisticsOverview;
  loading: boolean;
}) {
  const played = match.status === 'FINISHED' || match.status === 'LIVE' || match.status === 'HALFTIME';
  if (!played || loading) return null;
  if (!stats) return null;

  const { home, away } = stats.team;
  const showTeam = hasTeamStats(home, away);
  const showPlayers = stats.players.home.length > 0 || stats.players.away.length > 0;
  if (!showTeam && !showPlayers) return null;

  return (
    <section className="mt-10 sm:mt-12">
      <Reveal>
        <NewsSectionTitle>Statistika utakmice</NewsSectionTitle>
      </Reveal>

      {showTeam && (
        <Reveal delay={0.05}>
          <div className="border-gradient-club glass-premium mb-6 space-y-4 rounded-2xl p-4 sm:p-6">
            <div className="mb-2 grid grid-cols-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              <span className="text-right">{match.homeClub?.name ?? 'Domaći'}</span>
              <span />
              <span>{match.awayClub?.name ?? 'Gosti'}</span>
            </div>
            <MatchStatBar label="Golovi" home={home.goals} away={away.goals} />
            {(home.possession != null || away.possession != null) && (
              <MatchStatBar
                label="Posjed"
                home={home.possession ?? (away.possession != null ? 100 - away.possession : 50)}
                away={away.possession ?? (home.possession != null ? 100 - home.possession : 50)}
                suffix="%"
              />
            )}
            <MatchStatBar label="Udarci" home={home.shots} away={away.shots} />
            <MatchStatBar label="U okvir" home={home.shotsOn} away={away.shotsOn} />
            <MatchStatBar label="Korneri" home={home.corners} away={away.corners} />
            <MatchStatBar label="Prekršaji" home={home.fouls} away={away.fouls} />
            <MatchStatBar label="Zaleđe" home={home.offsides} away={away.offsides} />
            <MatchStatBar label="Žuti kartoni" home={home.yellowCards} away={away.yellowCards} />
            <MatchStatBar label="Crveni kartoni" home={home.redCards} away={away.redCards} />
            {(home.saves > 0 || away.saves > 0) && (
              <MatchStatBar label="Odbrane" home={home.saves} away={away.saves} />
            )}
            {(home.penaltiesScored > 0 ||
              away.penaltiesScored > 0 ||
              home.penaltiesMissed > 0 ||
              away.penaltiesMissed > 0) && (
              <>
                <MatchStatBar label="Penali (gol)" home={home.penaltiesScored} away={away.penaltiesScored} />
                <MatchStatBar label="Penali (promašaj)" home={home.penaltiesMissed} away={away.penaltiesMissed} />
              </>
            )}
          </div>
        </Reveal>
      )}

      {showPlayers && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal delay={0.08}>
            <MatchPlayerStatsTable title={match.homeClub?.name ?? 'Domaći'} players={stats.players.home} />
          </Reveal>
          <Reveal delay={0.12}>
            <MatchPlayerStatsTable title={match.awayClub?.name ?? 'Gosti'} players={stats.players.away} />
          </Reveal>
        </div>
      )}
    </section>
  );
}
