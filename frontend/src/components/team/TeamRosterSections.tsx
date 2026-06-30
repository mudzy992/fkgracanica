import type { Player } from '../../types';
import type { ClubSeasonStats, ClubSquadSlot } from '../../types/club-hub';
import { groupPlayersByPosition } from '../../lib/player-utils';
import { NewsSectionTitle } from '../news/NewsSectionTitle';
import { PlayerPortraitCard } from './PlayerPortraitCard';

interface Props {
  bench: ClubSquadSlot[];
  squadPlayers: Player[];
  statsMap: Map<string, NonNullable<ClubSeasonStats['players'][0]['stats']>>;
}

export function TeamRosterSections({ bench, squadPlayers, statsMap }: Props) {
  const groups = groupPlayersByPosition(squadPlayers);

  return (
    <div className="space-y-12">
      {bench.length > 0 && (
        <section>
          <NewsSectionTitle>Klupa</NewsSectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {bench.map((slot, i) => (
              <PlayerPortraitCard
                key={slot.id}
                player={slot.player!}
                stats={statsMap.get(slot.player!.id)}
                delay={i * 0.04}
              />
            ))}
          </div>
        </section>
      )}

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
