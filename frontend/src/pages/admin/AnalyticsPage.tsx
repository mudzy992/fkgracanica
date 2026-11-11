import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSeasons } from '../../hooks';
import { asArray } from '../../lib/as-array';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
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
  const { data, isLoading, isError, refetch } = useTeamAnalytics(seasonId || undefined);

  return (
    <>
      <Seo title={t('admin.analytics')} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('admin.analytics')}</h1>
        {tab === 'team' && (
          <Select
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
          >
            <option value="">{t('admin.analyticsPage.allSeasons')}</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="mb-5 flex gap-2 border-b border-[var(--border-subtle)]">
        {TABS.map(({ id, labelKey }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            onClick={() => setTab(id)}
            className={[
              'h-auto rounded-none border-b-2 px-1 pb-2 text-sm font-medium',
              tab === id
                ? 'border-primary text-text'
                : 'border-transparent text-text-muted hover:text-text',
            ].join(' ')}
          >
            {t(labelKey)}
          </Button>
        ))}
      </div>

      {tab === 'h2h' ? (
        <AnalyticsH2hPanel />
      ) : tab === 'player' ? (
        <AnalyticsPlayerPanel />
      ) : tab === 'visitors' ? (
        <AnalyticsVisitorsPanel />
      ) : isError ? (
        <Button variant="outline" onClick={() => void refetch()}>
          {t('actions.retry')}
        </Button>
      ) : isLoading || !data ? (
        <p className="text-sm text-text-muted">{t('admin.common.loading')}</p>
      ) : (
        <AnalyticsTeamPanel data={data} />
      )}
    </>
  );
}
