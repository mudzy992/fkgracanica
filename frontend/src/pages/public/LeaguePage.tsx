import { Link } from 'react-router-dom';
import { ClubLink } from '../../components/public/clubs/ClubLink';
import { ClubCrest } from '../../components/public/clubs/ClubCrest';
import { LeagueStandingsMobile } from '../../components/public/league/LeagueStandingsMobile';
import { LeagueFormDots } from '../../components/public/league/LeagueFormDots';
import { PlayerLink } from '../../components/public/players/PlayerLink';
import { useMatches, useSeasons, useStandings, useTopAssists, useTopScorers } from '../../hooks';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import type { Club, StandingRow } from '../../types';

function ClubCell({ row }: { row: StandingRow }) {
  if (row.clubSlug) {
    return <ClubLink slug={row.clubSlug} name={row.clubName} />;
  }
  return <span className="font-medium">{row.clubName}</span>;
}

function LeadersTable({
  title,
  rows,
}: {
  title: string;
  rows?: { playerId: string; firstName: string; lastName: string; value: number }[];
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface/50 text-left text-text-muted">
                <th className="px-4 py-3 w-12">#</th>
                <th className="px-4 py-3">Igrač</th>
                <th className="px-4 py-3 text-right">Ukupno</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((row, i) => (
                <tr key={row.playerId} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-text-muted">{i + 1}</td>
                  <td className="px-4 py-3">
                    <PlayerLink id={row.playerId} name={`${row.firstName} ${row.lastName}`} />
                  </td>
                  <td className="px-4 py-3 text-right text-base font-bold">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}

function MatchClubName({ club }: { club?: Club }) {
  if (!club) return <span>—</span>;
  if (club.slug) return <ClubLink slug={club.slug} name={club.name} className="text-base" />;
  return <span className="font-medium">{club.name}</span>;
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
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 md:py-14">
      <Seo title="Liga" />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Liga</h1>
        <p className="text-text-muted">Tabela, rezultati i statistike sezone.</p>
      </header>

      <div className="grid gap-8 xl:grid-cols-5">
        <section className="space-y-4 xl:col-span-3">
          <h2 className="text-xl font-semibold tracking-tight">Tabela</h2>
          {sl || stl ? (
            <Skeleton className="h-64" />
          ) : (
            <>
              <LeagueStandingsMobile rows={standings ?? []} />
              <Card className="hidden lg:block">
                <CardContent className="overflow-x-auto p-0">
                  <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b bg-surface/50 text-left text-text-muted">
                      <th className="px-4 py-3 w-10">#</th>
                      <th className="px-4 py-3">Klub</th>
                      <th className="px-4 py-3 text-center">O</th>
                      <th className="px-4 py-3 text-center font-bold">Bod</th>
                      <th className="px-4 py-3">Forma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(standings ?? []).map((row, i) => (
                      <tr key={row.clubId} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3.5 text-text-muted">{i + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <ClubCrest club={{ name: row.clubName }} size="sm" />
                            <ClubCell row={row} />
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">{row.played}</td>
                        <td className="px-4 py-3.5 text-center text-base font-bold">{row.points}</td>
                        <td className="px-4 py-3.5">
                          <LeagueFormDots form={row.form} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            </>
          )}
        </section>

        <section className="space-y-4 xl:col-span-2">
          <h2 className="text-xl font-semibold tracking-tight">Posljednji rezultati</h2>
          <div className="space-y-3">
            {ml
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)
              : results?.map((m) => (
                  <Link key={m.id} to={`/utakmice/${m.id}`} className="block">
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
                            <MatchClubName club={m.homeClub} />
                            <ClubCrest club={m.homeClub} size="sm" />
                          </div>
                          <p className="shrink-0 text-lg font-bold tabular-nums">
                            {m.homeScore}:{m.awayScore}
                          </p>
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <ClubCrest club={m.awayClub} size="sm" />
                            <MatchClubName club={m.awayClub} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-text-muted">
                          <span>{formatDateTime(m.scheduledAt)}</span>
                          <Badge variant="muted">Kraj</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </section>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {scl ? <Skeleton className="h-48" /> : <LeadersTable title="Najbolji strijelci" rows={scorers} />}
        {acl ? <Skeleton className="h-48" /> : <LeadersTable title="Najbolji asistenti" rows={assists} />}
      </div>
    </div>
  );
}
