import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSeasons } from '../../hooks';
import { asArray } from '../../lib/as-array';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { useTeamAnalytics } from '../../hooks/use-analytics';
import { AnalyticsTeamPanel } from './analytics/AnalyticsTeamPanel';
import { AnalyticsH2hPanel } from './analytics/AnalyticsH2hPanel';
import { AnalyticsPlayerPanel } from './analytics/AnalyticsPlayerPanel';
import { AnalyticsVisitorsPanel } from './analytics/AnalyticsVisitorsPanel';

type Tab = 'team' | 'h2h' | 'player' | 'visitors';

const TABS: { id: Tab; labelKey: string }[] = [
  { id: 'team', labelKey: 'admin.analyticsTabs.team' },
  { id: 'h2h', labelKey: 'admin.analyticsTabs.h2h' },
  { id: 'player', labelKey: 'admin.analyticsTabs.players' },
  { id: 'visitors', labelKey: 'admin.analyticsTabs.visitors' },
];

export function AnalyticsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('team');
  const [seasonId, setSeasonId] = useState('');
  const { data: seasonsRaw } = useSeasons();
  const seasons = asArray<{ id: string; name: string }>(seasonsRaw);
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useTeamAnalytics(
    seasonId || undefined,
  );

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const allSeasonsLabel = t('admin.analyticsPage.allSeasons', {
    defaultValue: 'Sve sezone',
  }) as string;

  return (
    <>
      <Seo title={t('admin.analytics') as string} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('admin.analytics')}</h1>
        {tab === 'team' && (
          <Select
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
            disabled={Boolean(isFetching)}
          >
            <option value="">{allSeasonsLabel}</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div role="tablist" className="mb-5 flex gap-2 border-b border-[var(--border-subtle)]">
        {TABS.map(({ id, labelKey }) => {
          const label = t(labelKey, { defaultValue: id }) as string;
          const selected = tab === id;
          return (
            <Button
              key={id}
              role="tab"
              aria-selected={selected}
              aria-pressed={selected}
              variant={selected ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTab(id)}
              className={[
                'h-auto rounded-none border-b-2 px-1 pb-2 text-sm font-medium',
                selected
                  ? 'border-primary text-text'
                  : 'border-transparent text-text-muted hover:text-text',
              ].join(' ')}
            >
              {label}
            </Button>
          );
        })}
      </div>

      {tab === 'team' && lastUpdated && !isLoading && !isError ? (
        <div className="mb-3 flex items-center justify-end gap-3 text-xs text-text-muted">
          <span>
            {t('admin.home.lastUpdated', {
              defaultValue: 'Ažurirano u {{time}}',
              time: lastUpdated,
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={Boolean(isFetching)}
          >
            {isFetching
              ? (t('admin.common.loading') as string)
              : (t('admin.home.refresh', { defaultValue: 'Osvježi' }) as string)}
          </Button>
        </div>
      ) : null}

      {tab === 'h2h' ? (
        <AnalyticsH2hPanel />
      ) : tab === 'player' ? (
        <AnalyticsPlayerPanel />
      ) : tab === 'visitors' ? (
        <AnalyticsVisitorsPanel />
      ) : isError ? (
        <div role="alert" className="flex flex-col gap-3 p-4">
          <p className="text-sm text-danger">
            {t('admin.common.loadError', { defaultValue: 'Greška pri učitavanju.' })}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={Boolean(isFetching)}
          >
            {isFetching
              ? (t('admin.common.loading') as string)
              : (t('actions.retry', { defaultValue: 'Pokušaj ponovo' }) as string)}
          </Button>
        </div>
      ) : isLoading || !data ? (
        <div aria-busy="true" className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
          <p className="sr-only">{t('admin.common.loading')}</p>
        </div>
      ) : (
        <AnalyticsTeamPanel data={data} />
      )}
    </>
  );
}
