import { Link } from 'react-router-dom';
import { PlayerLink } from '../public/players/PlayerLink';
import { NewsSectionTitle } from '../news/NewsSectionTitle';
import { Reveal } from '../../lib/motion/Reveal';
import type { Match, MatchLineup } from '../../types';

function LineupList({ title, rows }: { title: string; rows: MatchLineup[] }) {
  if (!rows.length) return null;
  return (
    <div>
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
        {title}
      </h3>
      <ul className="space-y-1.5 text-sm">
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
    <div className="border-gradient-club glass-premium rounded-2xl p-5 sm:p-6">
      <p className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-text">{title}</p>
      <div className="space-y-4">
        <LineupList title="Startna postava" rows={starters} />
        <LineupList title="Rezerve" rows={subs} />
      </div>
    </div>
  );
}

export function MatchLineupSection({ match }: { match: Match }) {
  const lineup = match.lineup ?? match.lineups ?? [];
  if (!lineup.length) return null;

  const home = lineup.filter((l) => l.clubId === match.homeClubId || l.player?.clubId === match.homeClubId);
  const away = lineup.filter((l) => l.clubId === match.awayClubId || l.player?.clubId === match.awayClubId);

  return (
    <section className="mt-10 sm:mt-12">
      <Reveal>
        <NewsSectionTitle>Postave</NewsSectionTitle>
      </Reveal>
      <div className="mt-2 grid gap-4 md:grid-cols-2">
        <Reveal delay={0.05}>
          <ClubLineupCard title={match.homeClub?.name ?? 'Domaći'} lineup={home} />
        </Reveal>
        <Reveal delay={0.1}>
          <ClubLineupCard title={match.awayClub?.name ?? 'Gosti'} lineup={away} />
        </Reveal>
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
    <section className="mt-10 sm:mt-12">
      <Reveal>
        <NewsSectionTitle>Povezane vijesti</NewsSectionTitle>
      </Reveal>
      <div className="mt-2 space-y-2">
        {items.map((n, i) => (
          <Reveal key={n.id} delay={Math.min(i * 0.04, 0.2)}>
            <Link
              to={`/vijesti/${n.slug}`}
              className="border-gradient-club glass-premium card-lift block rounded-xl px-4 py-3 text-sm font-medium text-text transition hover:text-primary"
            >
              {n.title}
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
