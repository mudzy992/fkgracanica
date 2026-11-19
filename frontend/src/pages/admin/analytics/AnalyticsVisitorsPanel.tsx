import { useVisitorGeo, useVisitorTrend, useVisitorTotals } from '../../../hooks/use-analytics';
import { Card } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { AnalyticsGeoPanel } from './AnalyticsGeoPanel';
import { AnalyticsVisitorsTrendChart } from './AnalyticsVisitorsTrendChart';

export function AnalyticsVisitorsPanel() {
  const { t } = useTranslation();
  const totalsQ = useVisitorTotals(30);
  const trendQ = useVisitorTrend(30);
  const geoQ = useVisitorGeo(30);

  const isLoading = totalsQ.isLoading || trendQ.isLoading || geoQ.isLoading;
  const isError = totalsQ.isError || trendQ.isError || geoQ.isError;
  const isFetching = totalsQ.isFetching || trendQ.isFetching || geoQ.isFetching;
  const dataUpdatedAt = Math.max(
    totalsQ.dataUpdatedAt ?? 0,
    trendQ.dataUpdatedAt ?? 0,
    geoQ.dataUpdatedAt ?? 0,
  );
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const totals = totalsQ.data;
  const trend = trendQ.data;
  const geo = geoQ.data;

  const handleRetry = () => {
    void totalsQ.refetch();
    void trendQ.refetch();
    void geoQ.refetch();
  };

  const handleRefresh = () => {
    void totalsQ.refetch();
    void trendQ.refetch();
    void geoQ.refetch();
  };

  if (isError) {
    return (
      <div role="alert" className="flex flex-col gap-3 p-4">
        <p className="text-sm text-danger">
          {t('admin.common.loadError', { defaultValue: 'Greška pri učitavanju.' })}
        </p>
        <Button variant="outline" size="sm" onClick={handleRetry} disabled={Boolean(isFetching)}>
          {isFetching
            ? (t('admin.common.loading') as string)
            : (t('admin.common.retry', { defaultValue: 'Pokušaj ponovo' }) as string)}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div aria-busy="true" className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
        <p className="sr-only">{t('admin.common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {lastUpdated ? (
        <div className="flex items-center justify-end gap-3 text-xs text-text-muted">
          <span>
            {t('admin.home.lastUpdated', {
              defaultValue: 'Ažurirano u {{time}}',
              time: lastUpdated,
            })}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={Boolean(isFetching)}>
            {isFetching
              ? (t('admin.common.loading') as string)
              : (t('admin.home.refresh', { defaultValue: 'Osvježi' }) as string)}
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: t('admin.analyticsPanel.web30'), value: totals?.web ?? 0 },
          { label: t('admin.analyticsPanel.mobile30'), value: totals?.mobile ?? 0 },
          { label: t('admin.analyticsPanel.total30'), value: totals?.total ?? 0 },
        ].map((item) => (
          <Card key={item.label} className="bg-surface/50 p-4">
            <p className="text-sm text-text-muted">{item.label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-primary-light">{item.value}</p>
          </Card>
        ))}
      </div>

      {trend && trend.length > 0 ? (
        <>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-muted">
              {t('admin.analyticsPanel.dailyTrend')}
            </h3>
            <AnalyticsVisitorsTrendChart trend={trend} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-muted">
              {t('admin.analyticsPanel.table')}
            </h3>
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow className="border-b border-[var(--border-subtle)] text-left text-xs text-text-muted">
                      <TableHead className="px-4 py-2">{t('admin.analyticsPanel.date')}</TableHead>
                      <TableHead className="px-4 py-2 text-right">{t('admin.visitors.web')}</TableHead>
                      <TableHead className="px-4 py-2 text-right">
                        {t('admin.visitors.mobile')}
                      </TableHead>
                      <TableHead className="px-4 py-2 text-right">
                        {t('admin.visitors.total')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trend
                      .slice()
                      .reverse()
                      .map((row) => (
                        <TableRow
                          key={row.date}
                          className="border-b border-[var(--border-subtle)] last:border-0"
                        >
                          <TableCell className="px-4 py-2 text-text-muted">{row.date}</TableCell>
                          <TableCell className="px-4 py-2 text-right tabular-nums">
                            {row.web}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-right tabular-nums">
                            {row.mobile}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-right tabular-nums font-medium">
                            {row.total}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <p className="text-sm text-text-muted">
          {t('admin.analyticsPanel.noTrend', { defaultValue: 'Nema podataka o trendu.' })}
        </p>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-text-muted">
          {t('admin.analyticsPanel.geo')}
        </h3>
        <AnalyticsGeoPanel rows={geo ?? []} />
      </div>
    </div>
  );
}
