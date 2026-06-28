import { useEffect, useMemo, useState } from 'react';
import { LeagueStandingsMobile } from '../../components/public/league/LeagueStandingsMobile';
import { LeagueStandingsTable } from '../../components/public/league/LeagueStandingsTable';
import { LeagueSeasonPicker } from '../../components/public/league/LeagueSeasonPicker';
import { LeagueRoundPicker } from '../../components/public/league/LeagueRoundPicker';
import { LeagueResultsByRound } from '../../components/public/league/LeagueResultsByRound';
import { LeagueLiveMatches } from '../../components/public/league/LeagueLiveMatches';
import { LeagueNextMatch } from '../../components/public/league/LeagueNextMatch';
import { PlayerLink } from '../../components/public/players/PlayerLink';
import { useMatches, useSeasons, useStandings, useTopAssists, useTopScorers } from '../../hooks';
import { useRounds } from '../../hooks/use-rounds';
import { pickDefaultSeasonId, type SeasonOption } from '../../lib/season-utils';
import { Seo } from '../../components/seo/Seo';
import { PremiumCard } from '../../components/public/shell/PremiumCard';
import { Skeleton } from '../../components/ui/skeleton';
import { Card, CardContent } from '../../components/ui/card';

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
                <th className="w-12 px-4 py-3">#</th>
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

export function LeaguePage() {
  const { data: seasons, isLoading: sl } = useSeasons();
  const seasonOptions = useMemo(() => (seasons as SeasonOption[] | undefined) ?? [], [seasons]);
  const [seasonId, setSeasonId] = useState<string | undefined>();
  const [upToRound, setUpToRound] = useState<number | null>(null);

  useEffect(() => {
    if (!seasonOptions.length) return;
    setSeasonId((prev) =>
      prev && seasonOptions.some((s) => s.id === prev) ? prev : pickDefaultSeasonId(seasonOptions),
    );
  }, [seasonOptions]);

  useEffect(() => setUpToRound(null), [seasonId]);

  const activeSeason = seasonOptions.find((s) => s.id === seasonId);
  const { data: rounds } = useRounds(seasonId);
  const { data: standings, isLoading: stl } = useStandings(seasonId, upToRound);
  const { data: scorers, isLoading: scl } = useTopScorers(seasonId);
  const { data: assists, isLoading: acl } = useTopAssists(seasonId);
  const { data: matches, isLoading: ml } = useMatches(seasonId);

  const tableTitle = upToRound ? `Tabela do ${upToRound}. kola` : 'Ukupna tabela';

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 md:py-14">
      <Seo title="Liga" />
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Liga</h1>
          <p className="text-text-muted">
            {activeSeason ? `${activeSeason.name} — ${tableTitle.toLowerCase()}` : 'Tabela, rezultati i statistike sezone.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!sl && <LeagueSeasonPicker seasons={seasonOptions} value={seasonId} onChange={setSeasonId} />}
          <LeagueRoundPicker rounds={rounds ?? []} value={upToRound} onChange={setUpToRound} />
        </div>
      </header>

      <LeagueNextMatch matches={matches ?? []} />
      <LeagueLiveMatches matches={matches ?? []} />

      <div className="grid gap-8 xl:grid-cols-5">
        <section className="space-y-4 xl:col-span-3">
          <h2 className="text-xl font-semibold tracking-tight">{tableTitle}</h2>
          {sl || stl ? (
            <Skeleton className="h-64" />
          ) : (
            <>
              <LeagueStandingsMobile rows={standings ?? []} />
              <PremiumCard className="hidden overflow-x-auto p-0 lg:block" hover={false}>
                <LeagueStandingsTable rows={standings ?? []} />
              </PremiumCard>
            </>
          )}
        </section>

        <section className="space-y-4 xl:col-span-2">
          <h2 className="text-xl font-semibold tracking-tight">Rezultati po kolima</h2>
          <LeagueResultsByRound matches={matches ?? []} loading={ml} />
        </section>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {scl ? <Skeleton className="h-48" /> : <LeadersTable title="Najbolji strijelci (sezona)" rows={scorers} />}
        {acl ? <Skeleton className="h-48" /> : <LeadersTable title="Najbolji asistenti (sezona)" rows={assists} />}
      </div>
    </div>
  );
}
