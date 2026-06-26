import { Link } from 'react-router-dom';
import type { Match, Player } from '../../types';
import { PhotoGridWithLightbox } from '../public/PhotoGridWithLightbox';
import { PlayerCard } from '../public/players/PlayerCard';
import { Card, CardContent } from '../ui/card';

export function NewsRelatedMatches({ matches }: { matches?: { match?: Match }[] }) {
  if (!matches?.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold">Povezane utakmice</h2>
      <div className="space-y-2">
        {matches.map((rm) => {
          const m = rm.match;
          if (!m) return null;
          return (
            <Link key={m.id} to={`/utakmice/${m.id}`}>
              <Card className="hover:shadow-sm">
                <CardContent className="p-4 text-sm font-medium">
                  {m.homeClub?.name} {m.homeScore}:{m.awayScore} {m.awayClub?.name}
                </CardContent>
              </Card>
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
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold">Povezani igrači</h2>
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

export function NewsGalleryPhotos({ photos }: { photos?: { id: string; path: string; caption?: string | null }[] }) {
  if (!photos?.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold">Galerija</h2>
      <PhotoGridWithLightbox photos={photos} />
    </section>
  );
}
