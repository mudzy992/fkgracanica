import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSeasons } from '../../hooks';
import { asArray } from '../../lib/as-array';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { useTeamAnalytics } from '../../hooks/use-analytics';
import { AnalyticsTeamPanel } from './analytics/AnalyticsTeamPanel';
import { AnalyticsH2hPanel } from './analytics/AnalyticsH2hPanel';
import { AnalyticsPlayerPanel } from './analytics/AnalyticsPlayerPanel';
import { AnalyticsVisitorsPanel } from './analytics/AnalyticsVisitorsPanel';

type Tab = 'team' | 'h2h' | 'player' | 'visitors';

const TABS: { id: Tab; label: string }[] = [
  { id: 'team', label: 'Tim' },
  { id: 'h2h', label: 'H2H' },
  { id: 'player', label: 'Igrači' },
  { id: 'visitors', label: 'Posjetioci' },
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
          <select
            className="h-10 rounded-lg border border-[var(--border-subtle)] bg-background px-3 text-sm"
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
          >
            <option value="">Sve sezone</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-5 flex gap-2 border-b border-[var(--border-subtle)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              'pb-2 text-sm font-medium transition-colors',
              tab === t.id
                ? 'border-b-2 border-primary text-text'
                : 'text-text-muted hover:text-text',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'h2h' ? (
        <AnalyticsH2hPanel />
      ) : tab === 'player' ? (
        <AnalyticsPlayerPanel />
      ) : tab === 'visitors' ? (
        <AnalyticsVisitorsPanel />
      ) : isError ? (
        <Button variant="outline" onClick={() => void refetch()}>Pokušaj ponovo</Button>
      ) : isLoading || !data ? (
        <p className="text-sm text-text-muted">Učitavanje...</p>
      ) : (
        <AnalyticsTeamPanel data={data} />
      )}
    </>
  );
}
