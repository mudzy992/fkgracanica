import type { ClubSeasonStats } from '../../types/club-hub';
import { PlayerLink } from '../public/players/PlayerLink';
import { Card, CardContent } from '../ui/card';

export function ClubStatsSummary({ stats }: { stats?: ClubSeasonStats }) {
  if (!stats?.season) {
    return <p className="text-sm text-text-muted">Statistike za aktivnu sezonu nisu dostupne.</p>;
  }
  const { standing, totals } = stats;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-text-muted">Sezona</p>
          <p className="text-lg font-bold">{stats.season.name}</p>
        </CardContent>
      </Card>
      {standing && (
        <>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-text-muted">Bodovi</p>
              <p className="text-lg font-bold">{standing.points}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-text-muted">Gol razlika</p>
              <p className="text-lg font-bold">
                {standing.goalsFor}:{standing.goalsAgainst}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-text-muted">Forma</p>
              <p className="text-lg font-bold tracking-widest">{standing.form || '—'}</p>
            </CardContent>
          </Card>
        </>
      )}
      <Card className="sm:col-span-2 lg:col-span-4">
        <CardContent className="grid grid-cols-2 gap-3 p-4 text-sm md:grid-cols-5">
          <div><span className="text-text-muted">Golovi</span><p className="font-bold">{totals.goals}</p></div>
          <div><span className="text-text-muted">Asist.</span><p className="font-bold">{totals.assists}</p></div>
          <div><span className="text-text-muted">Nastupi</span><p className="font-bold">{totals.appearances}</p></div>
          <div><span className="text-text-muted">Žuti</span><p className="font-bold">{totals.yellowCards}</p></div>
          <div><span className="text-text-muted">Crveni</span><p className="font-bold">{totals.redCards}</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PlayerStatsTable({ stats }: { stats: ClubSeasonStats }) {
  const rows = stats.players.filter((p) => p.stats);
  if (!rows.length) return <p className="text-sm text-text-muted">Nema statistike igrača za sezonu.</p>;
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-surface text-left text-text-muted">
            <th className="p-3">Igrač</th>
            <th className="p-3">Nast.</th>
            <th className="p-3">Gol</th>
            <th className="p-3">Asist.</th>
            <th className="p-3">Ž/K</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-[var(--border-subtle)]">
              <td className="p-3 font-medium">
                <PlayerLink id={p.id} name={`${p.firstName} ${p.lastName}`} />
              </td>
              <td className="p-3">{p.stats?.appearances ?? 0}</td>
              <td className="p-3">{p.stats?.goals ?? 0}</td>
              <td className="p-3">{p.stats?.assists ?? 0}</td>
              <td className="p-3">
                {p.stats?.yellowCards ?? 0}/{p.stats?.redCards ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
