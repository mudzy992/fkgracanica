import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Match, Player } from '../../types';
import { PlayerCard } from '../public/players/PlayerCard';
import { NewsSectionTitle } from './NewsSectionTitle';

export function NewsRelatedMatches({ matches }: { matches?: { match?: Match }[] }) {
  if (!matches?.length) return null;

  return (
    <section className="mt-12">
      <NewsSectionTitle>Povezane utakmice</NewsSectionTitle>
      <div className="space-y-3">
        {matches.map((rm) => {
          const m = rm.match;
          if (!m) return null;
          return (
            <Link key={m.id} to={`/utakmice/${m.id}`} className="group block">
              <div className="glass-premium card-lift flex items-center justify-between rounded-xl px-5 py-4">
                <div className="min-w-0 flex-1 text-sm font-medium text-white/90">
                  <span className="truncate">{m.homeClub?.name}</span>
                  <span className="mx-2 font-display text-lg font-bold text-primary-light">
                    {m.homeScore}:{m.awayScore}
                  </span>
                  <span className="truncate">{m.awayClub?.name}</span>
                </div>
                <ChevronRight
                  size={18}
                  className="shrink-0 text-white/30 transition group-hover:text-primary-light"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function NewsRelatedPlayers({ players }: { players?: { player?: Player }[] }) {
  if (!players?.length) return null;

  return (
    <section className="mt-12">
      <NewsSectionTitle>Povezani igrači</NewsSectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        {players.map((rp) => {
          const p = rp.player;
          if (!p) return null;
          return <PlayerCard key={p.id} player={p} />;
        })}
      </div>
    </section>
  );
}
