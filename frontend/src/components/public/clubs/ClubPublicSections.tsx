import { PlayerCard } from '../players/PlayerCard';
import type { Player } from '../../../types';

export function ClubPlayersGrid({ players }: { players: Player[] }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-text">Kadar</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((p) => (
          <PlayerCard key={p.id} player={p} />
        ))}
      </div>
    </section>
  );
}
