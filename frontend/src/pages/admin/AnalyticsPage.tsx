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

type Tab = 'team' | 'h2h' | 'player';

export function AnalyticsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('team');
  const { data: seasonsRaw } = useSeasons();
  const seasons = asArray<{ id: string; name: string }>(seasonsRaw);
  const [seasonId, setSeasonId] = useState('');
  const { data, isLoading, isError, refetch } = useTeamAnalytics(seasonId || undefined);

  return (
    <>
      <Seo title={t('admin.analytics')} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('admin.analytics')}</h1>
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
      </div>
      <div className="mb-4 flex gap-2">
        <Button size="sm" variant={tab === 'team' ? 'default' : 'outline'} onClick={() => setTab('team')}>
          Tim
        </Button>
        <Button size="sm" variant={tab === 'h2h' ? 'default' : 'outline'} onClick={() => setTab('h2h')}>
          H2H
        </Button>
        <Button size="sm" variant={tab === 'player' ? 'default' : 'outline'} onClick={() => setTab('player')}>
          Igrači
        </Button>
      </div>
      {tab === 'h2h' ? (
        <AnalyticsH2hPanel />
      ) : tab === 'player' ? (
        <AnalyticsPlayerPanel />
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
