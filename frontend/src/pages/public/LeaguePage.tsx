import { Link } from 'react-router-dom';
import { useMatches, useSeasons, useStandings, useTopAssists, useTopScorers } from '../../hooks';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

function LeadersTable({ title, rows }: { title: string; rows?: { firstName: string; lastName: string; value: number }[] }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-text-muted">
                <th className="p-3">#</th>
                <th className="p-3">Igrač</th>
                <th className="p-3 text-right">Ukupno</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((row, i) => (
                <tr key={`${row.firstName}-${row.lastName}`} className="border-b border-slate-100">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium">
                    {row.firstName} {row.lastName}
                  </td>
                  <td className="p-3 text-right font-bold">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}

export function LeaguePage() {
  const { data: seasons, isLoading: sl } = useSeasons();
  const seasonId = (seasons as { id: string }[] | undefined)?.[0]?.id;
  const { data: standings, isLoading: stl } = useStandings(seasonId);
  const { data: scorers, isLoading: scl } = useTopScorers(seasonId);
  const { data: assists, isLoading: acl } = useTopAssists(seasonId);
  const { data: matches, isLoading: ml } = useMatches(seasonId);
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
          {sl || stl ? (
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
                      <th className="p-3">Forma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(standings ?? []).map((row, i) => (
                      <tr key={row.clubId} className="border-b border-slate-100">
                        <td className="p-3">{i + 1}</td>
                        <td className="p-3 font-medium">{row.clubName}</td>
                        <td className="p-3">{row.played}</td>
                        <td className="p-3 font-bold">{row.points}</td>
                        <td className="p-3 font-mono text-xs">{row.form}</td>
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
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {scl ? <Skeleton className="h-48" /> : <LeadersTable title="Najbolji strijelci" rows={scorers} />}
        {acl ? <Skeleton className="h-48" /> : <LeadersTable title="Najbolji asistenti" rows={assists} />}
      </div>
    </div>
  );
}
