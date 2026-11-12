import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { NewsSectionTitle } from '../../news/NewsSectionTitle';
import { PlayerPortraitCard } from '../../team/PlayerPortraitCard';
import { groupPlayersByPosition } from '../../../lib/player-utils';
import type { Player } from '../../../types';
import type { ClubSeasonStats } from '../../../types/club-hub';
import { statsByPlayerId } from '../../team/team-stats-utils';

export function ClubPlayersGrid({
  players,
  stats,
}: {
  players: Player[];
  stats?: ClubSeasonStats | null;
}) {
  const statsMap = useMemo(() => statsByPlayerId(stats ?? undefined), [stats]);
  const groups = useMemo(() => groupPlayersByPosition(players), [players]);

  if (!players.length) return null;

  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <section key={group.position}>
          <NewsSectionTitle>{group.label}</NewsSectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {group.players.map((player, i) => (
              <PlayerPortraitCard
                key={player.id}
                player={player}
                stats={statsMap.get(player.id)}
                delay={i * 0.04}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ClubOwnTeamLink() {
  return (
    <section>
      <NewsSectionTitle>Naš klub</NewsSectionTitle>
      <div className="glass-premium rounded-2xl p-6 text-center sm:p-8">
        <p className="text-sm text-white/80">
          Kompletan uvid u prvi tim, formaciju i sezonske statistike.
        </p>
        <Link
          to="/tim"
          className="mt-4 inline-flex rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-primary/90"
        >
          Stranica prvog tima →
        </Link>
      </div>
    </section>
  );
}
