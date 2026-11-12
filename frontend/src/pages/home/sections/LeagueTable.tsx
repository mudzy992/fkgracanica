import { useTranslation } from 'react-i18next';
import { useSeasons, useStandings } from '../../../hooks';
import {
  leagueEdition,
  pickDefaultCalendarId,
  type CalendarSeason,
} from '../../../lib/season-utils';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';

export function LeagueTable() {
  const { t } = useTranslation();
  const { data: seasons, isLoading: sl } = useSeasons();
  const calendars = (seasons as CalendarSeason[] | undefined) ?? [];
  const calendar = calendars.find((s) => s.id === pickDefaultCalendarId(calendars)) ?? calendars[0];
  const seasonId = leagueEdition(calendar)?.id;
  const { data: standings, isLoading: stl } = useStandings(seasonId);
  const isLoading = sl || stl;

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
                <tr className="border-b border-[var(--border-subtle)] text-left text-text-muted">
                  <th className="p-3">#</th>
                  <th className="p-3">{t('home.tableClub')}</th>
                  <th className="p-3">{t('home.tablePlayed')}</th>
                  <th className="p-3">{t('home.tableWins')}</th>
                  <th className="p-3">{t('home.tableDraws')}</th>
                  <th className="p-3">{t('home.tableLosses')}</th>
                  <th className="p-3">{t('home.tableGoalsFor')}</th>
                  <th className="p-3">{t('home.tableGoalsAgainst')}</th>
                  <th className="p-3 font-bold">{t('home.tablePoints')}</th>
                </tr>
              </thead>
              <tbody>
                {(standings ?? []).map((row, i) => (
                  <tr key={row.clubId} className="border-b border-[var(--border-subtle)]">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3 font-medium">{row.clubName}</td>
                    <td className="p-3">{row.played}</td>
                    <td className="p-3">{row.won}</td>
                    <td className="p-3">{row.drawn}</td>
                    <td className="p-3">{row.lost}</td>
                    <td className="p-3">{row.goalsFor}</td>
                    <td className="p-3">{row.goalsAgainst}</td>
                    <td className="p-3 font-bold">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(standings ?? []).length === 0 && (
              <p className="p-6 text-center text-text-muted">{t('common.noResults')}</p>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
