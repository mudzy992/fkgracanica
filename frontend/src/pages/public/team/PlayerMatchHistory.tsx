import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { formatDateTime } from '../../../lib/utils';
import { NewsSectionTitle } from '../../../components/news/NewsSectionTitle';
import { useTranslation } from 'react-i18next';

export type PlayerMatchRow = {
  matchId: string;
  scheduledAt: string;
  status: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  isStarter: boolean;
  events: { type: string; minute: number }[];
};

export function PlayerMatchHistory({ playerId }: { playerId: string }) {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['players', playerId, 'matches'],
    queryFn: async () => (await api.get<PlayerMatchRow[]>(`/players/${playerId}/matches`)).data,
    enabled: !!playerId,
  });

  if (isLoading)
    return <p className="text-sm text-text-muted">{t('pages.player.loadingMatches')}</p>;
  if (!data?.length) return null;

  return (
    <section>
      <NewsSectionTitle>{t('pages.player.matches')}</NewsSectionTitle>
      <ul className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
        {data.map((row: PlayerMatchRow) => {
          const goals = row.events.filter(
            (e: PlayerMatchRow['events'][number]) =>
              e.type === 'GOAL' || e.type === 'PENALTY_SCORED',
          ).length;
          return (
            <li
              key={row.matchId}
              className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-text">
                  {row.home} {row.status === 'FINISHED' ? `${row.homeScore}:${row.awayScore}` : '–'}{' '}
                  {row.away}
                </p>
                <p className="text-xs text-text-muted">
                  {formatDateTime(row.scheduledAt)}
                  {row.isStarter
                    ? ` · ${t('pages.player.starter')}`
                    : ` · ${t('pages.player.bench')}`}
                  {goals ? ` · ${t('pages.player.goalsCount', { count: goals })}` : ''}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
