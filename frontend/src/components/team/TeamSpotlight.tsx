import type { Player } from '../../types';
import type { ClubSeasonStats } from '../../types/club-hub';
import { NewsSectionTitle } from '../news/NewsSectionTitle';
import { PlayerPortraitCard } from './PlayerPortraitCard';

interface Props {
  players: Player[];
  statsMap: Map<string, NonNullable<ClubSeasonStats['players'][0]['stats']>>;
}

export function TeamSpotlight({ players, statsMap }: Props) {
  if (!players.length) return null;

  return (
    <section>
      <NewsSectionTitle>Strijelci sezone</NewsSectionTitle>
      <div className="grid gap-4 sm:grid-cols-3">
        {players.map((player, i) => (
          <PlayerPortraitCard
            key={player.id}
            player={player}
            stats={statsMap.get(player.id)}
            delay={i * 0.08}
            spotlight
          />
        ))}
      </div>
    </section>
  );
}
