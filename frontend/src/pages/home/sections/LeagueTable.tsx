import { useTranslation } from 'react-i18next';
import { useClubs, useMatches } from '../../../hooks';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';

interface StandingRow {
  clubId: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  pts: number;
}

function computeStandings(
  matches: { homeClubId: string; awayClubId: string; homeScore: number; awayScore: number; status: string }[],
  clubs: { id: string; name: string }[],
): StandingRow[] {
  const map = new Map<string, StandingRow>();
  for (const club of clubs) {
    map.set(club.id, {
      clubId: club.id,
      name: club.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      pts: 0,
    });
  }
  for (const m of matches.filter((x) => x.status === 'FINISHED')) {
    const home = map.get(m.homeClubId);
    const away = map.get(m.awayClubId);
    if (!home || !away) continue;
    home.played++;
    away.played++;
    home.gf += m.homeScore;
    home.ga += m.awayScore;
    away.gf += m.awayScore;
    away.ga += m.homeScore;
    if (m.homeScore > m.awayScore) {
      home.won++;
      home.pts += 3;
      away.lost++;
    } else if (m.homeScore < m.awayScore) {
      away.won++;
      away.pts += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.pts += 1;
      away.pts += 1;
    }
  }
  return [...map.values()]
    .filter((r) => r.played > 0)
    .sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga));
}

export function LeagueTable() {
  const { t } = useTranslation();
  const { data: matches, isLoading: ml } = useMatches();
  const { data: clubList, isLoading: cl } = useClubs();
  const isLoading = ml || cl;
  const standings = matches && clubList ? computeStandings(matches, clubList) : [];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-6 text-2xl font-bold text-text">{t('home.leagueTable')}</h2>
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-text-muted">
                  <th className="p-3">#</th>
                  <th className="p-3">Klub</th>
                  <th className="p-3">O</th>
                  <th className="p-3">B</th>
                  <th className="p-3">N</th>
                  <th className="p-3">P</th>
                  <th className="p-3">DG</th>
                  <th className="p-3">RG</th>
                  <th className="p-3 font-bold">Bod</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => (
                  <tr key={row.clubId} className="border-b border-slate-100">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3 font-medium">{row.name}</td>
                    <td className="p-3">{row.played}</td>
                    <td className="p-3">{row.won}</td>
                    <td className="p-3">{row.drawn}</td>
                    <td className="p-3">{row.lost}</td>
                    <td className="p-3">{row.gf}</td>
                    <td className="p-3">{row.ga}</td>
                    <td className="p-3 font-bold">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {standings.length === 0 && (
              <p className="p-6 text-center text-text-muted">{t('common.noResults')}</p>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
