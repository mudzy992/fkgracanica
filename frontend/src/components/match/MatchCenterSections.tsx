import { Link } from 'react-router-dom';
import { PlayerLink } from '../public/players/PlayerLink';
import type { Match, MatchLineup } from '../../types';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

function LineupList({ title, rows }: { title: string; rows: MatchLineup[] }) {
  if (!rows.length) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-text-muted">{title}</h3>
      <ul className="space-y-1 text-sm">
        {rows.map((row) => (
          <li key={row.id}>
            {row.player && (
              <PlayerLink
                id={row.player.id}
                name={`${row.player.firstName} ${row.player.lastName}`}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MatchLineupSection({ match }: { match: Match }) {
  const lineup = match.lineup ?? match.lineups ?? [];
  if (!lineup.length) return null;
  const starters = lineup.filter((l) => l.isStarter);
  const subs = lineup.filter((l) => !l.isStarter);

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">Postave</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="mb-3 font-medium">{match.homeClub?.name}</p>
            <LineupList title="Startna postava" rows={starters} />
            <LineupList title="Rezerve" rows={subs} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function MatchTeamStatsSection({
  match,
  stats,
  loading,
}: {
  match: Match;
  stats?: { clubId: string; shots: number; shotsOn: number; corners: number; fouls: number; possession?: number | null }[];
  loading: boolean;
}) {
  if (loading) return <Skeleton className="mt-8 h-32" />;
  if (!stats?.length) return null;

  const home = stats.find((s) => s.clubId === match.homeClubId);
  const away = stats.find((s) => s.clubId === match.awayClubId);
  if (!home && !away) return null;

  const rows = [
    { label: 'Udarci', h: home?.shots ?? 0, a: away?.shots ?? 0 },
    { label: 'U okvir', h: home?.shotsOn ?? 0, a: away?.shotsOn ?? 0 },
    { label: 'Korneri', h: home?.corners ?? 0, a: away?.corners ?? 0 },
    { label: 'Prekršaji', h: home?.fouls ?? 0, a: away?.fouls ?? 0 },
  ];

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">Statistika</h2>
      <Card>
        <CardContent className="space-y-3 p-4">
          {rows.map((r) => (
            <div key={r.label} className="grid grid-cols-3 text-sm">
              <span className="text-right font-medium">{r.h}</span>
              <span className="text-center text-text-muted">{r.label}</span>
              <span className="font-medium">{r.a}</span>
            </div>
          ))}
        </CardContent>
      </Card>
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
  if (loading) return <Skeleton className="mt-8 h-24" />;
  if (!items?.length) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">Povezane vijesti</h2>
      <div className="space-y-2">
        {items.map((n) => (
          <Link key={n.id} to={`/vijesti/${n.slug}`} className="block rounded-lg border p-3 hover:bg-surface">
            {n.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
