import { Link } from 'react-router-dom';
import { PremiumCard } from '../public/shell/PremiumCard';
import { PlayerLink } from '../public/players/PlayerLink';
import type { Match, MatchLineup } from '../../types';

function LineupList({ title, rows }: { title: string; rows: MatchLineup[] }) {
  if (!rows.length) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-text-muted">{title}</h3>
      <ul className="space-y-1 text-sm">
        {rows.map((row) => (
          <li key={row.id}>
            {row.player && (
              <PlayerLink id={row.player.id} name={`${row.player.firstName} ${row.player.lastName}`} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClubLineupCard({ title, lineup }: { title: string; lineup: MatchLineup[] }) {
  if (!lineup.length) return null;
  const starters = lineup.filter((l) => l.isStarter);
  const subs = lineup.filter((l) => !l.isStarter);
  return (
    <PremiumCard className="p-4 sm:p-6" hover={false}>
      <p className="mb-3 font-medium">{title}</p>
      <LineupList title="Startna postava" rows={starters} />
      <LineupList title="Rezerve" rows={subs} />
    </PremiumCard>
  );
}

export function MatchLineupSection({ match }: { match: Match }) {
  const lineup = match.lineup ?? match.lineups ?? [];
  if (!lineup.length) return null;

  const home = lineup.filter((l) => l.clubId === match.homeClubId || l.player?.clubId === match.homeClubId);
  const away = lineup.filter((l) => l.clubId === match.awayClubId || l.player?.clubId === match.awayClubId);

  return (
    <section className="mt-8">
      <h2 className="font-display mb-4 text-xl font-semibold">Postave</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <ClubLineupCard title={match.homeClub?.name ?? 'Domaći'} lineup={home} />
        <ClubLineupCard title={match.awayClub?.name ?? 'Gosti'} lineup={away} />
      </div>
    </section>
  );
}

export function MatchRelatedNewsSection({
  items,
  loading,
}: {
  items?: { id: string; slug: string; title: string }[];
  loading: boolean;
}) {
  if (loading || !items?.length) return null;
  return (
    <section className="mt-8">
      <h2 className="font-display mb-4 text-xl font-semibold">Povezane vijesti</h2>
      <div className="space-y-2">
        {items.map((n) => (
          <Link key={n.id} to={`/vijesti/${n.slug}`}>
            <PremiumCard className="block p-3 text-sm">{n.title}</PremiumCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
