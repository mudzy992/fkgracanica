import { Link } from 'react-router-dom';
import { useClubs, useMatches } from '../../hooks';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

function computeStandings(
  matches: { homeClubId: string; awayClubId: string; homeScore: number; awayScore: number; status: string }[],
  clubs: { id: string; name: string }[],
) {
  const map = new Map<string, { name: string; pts: number; played: number; gf: number; ga: number }>();
  for (const c of clubs) map.set(c.id, { name: c.name, pts: 0, played: 0, gf: 0, ga: 0 });
  for (const m of matches.filter((x) => x.status === 'FINISHED')) {
    const h = map.get(m.homeClubId);
    const a = map.get(m.awayClubId);
    if (!h || !a) continue;
    h.played++;
    a.played++;
    h.gf += m.homeScore;
    h.ga += m.awayScore;
    a.gf += m.awayScore;
    a.ga += m.homeScore;
    if (m.homeScore > m.awayScore) h.pts += 3;
    else if (m.homeScore < m.awayScore) a.pts += 3;
    else {
      h.pts += 1;
      a.pts += 1;
    }
  }
  return [...map.values()].filter((r) => r.played > 0).sort((a, b) => b.pts - a.pts);
}

export function LeaguePage() {
  const { data: matches, isLoading: ml } = useMatches();
  const { data: clubs, isLoading: cl } = useClubs();
  const standings = matches && clubs ? computeStandings(matches, clubs) : [];
  const results = matches
    ?.filter((m) => m.status === 'FINISHED')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo title="Liga" />
      <h1 className="mb-8 text-3xl font-bold">Liga</h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-semibold">Tabela</h2>
          {ml || cl ? (
            <Skeleton className="h-48" />
          ) : (
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-text-muted">
                      <th className="p-3">#</th>
                      <th className="p-3">Klub</th>
                      <th className="p-3">O</th>
                      <th className="p-3">Bod</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row, i) => (
                      <tr key={row.name} className="border-b border-slate-100">
                        <td className="p-3">{i + 1}</td>
                        <td className="p-3 font-medium">{row.name}</td>
                        <td className="p-3">{row.played}</td>
                        <td className="p-3 font-bold">{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </section>
        <section>
          <h2 className="mb-4 text-xl font-semibold">Rezultati</h2>
          <div className="space-y-3">
            {ml
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)
              : results?.map((m) => (
                  <Link key={m.id} to={`/utakmice/${m.id}`}>
                    <Card className="hover:shadow-sm">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium">
                            {m.homeClub?.name} {m.homeScore}:{m.awayScore} {m.awayClub?.name}
                          </p>
                          <p className="text-xs text-text-muted">{formatDateTime(m.scheduledAt)}</p>
                        </div>
                        <Badge variant="muted">Kraj</Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}
