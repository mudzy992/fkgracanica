import { useVisitorGeo, useVisitorTrend, useVisitorTotals } from '../../../hooks/use-analytics';
import { useTranslation } from 'react-i18next';
import { AnalyticsGeoPanel } from './AnalyticsGeoPanel';
import { AnalyticsVisitorsTrendChart } from './AnalyticsVisitorsTrendChart';

export function AnalyticsVisitorsPanel() {
  const { t } = useTranslation();
  const { data: totals, isLoading: totalsLoading } = useVisitorTotals(30);
  const { data: trend, isLoading: trendLoading } = useVisitorTrend(30);
  const { data: geo, isLoading: geoLoading } = useVisitorGeo(30);

  if (totalsLoading || trendLoading || geoLoading) {
    return <p className="text-sm text-text-muted">{t('admin.analyticsPanel.loading')}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: t('admin.analyticsPanel.web30'), value: totals?.web ?? 0 },
          { label: t('admin.analyticsPanel.mobile30'), value: totals?.mobile ?? 0 },
          { label: t('admin.analyticsPanel.total30'), value: totals?.total ?? 0 },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[var(--border-subtle)] bg-surface/50 p-4"
          >
            <p className="text-sm text-text-muted">{item.label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-primary-light">{item.value}</p>
          </div>
        ))}
      </div>

      {trend && trend.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-text-muted">
            {t('admin.analyticsPanel.dailyTrend')}
          </h3>
          <AnalyticsVisitorsTrendChart trend={trend} />
        </div>
      )}

      {trend && trend.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-text-muted">
            {t('admin.analyticsPanel.table')}
          </h3>
          <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-text-muted">
                  <th className="px-4 py-2">{t('admin.analyticsPanel.date')}</th>
                  <th className="px-4 py-2 text-right">{t('admin.visitors.web')}</th>
                  <th className="px-4 py-2 text-right">{t('admin.visitors.mobile')}</th>
                  <th className="px-4 py-2 text-right">{t('admin.visitors.total')}</th>
                </tr>
              </thead>
              <tbody>
                {trend
                  .slice()
                  .reverse()
                  .map((row) => (
                    <tr
                      key={row.date}
                      className="border-b border-[var(--border-subtle)] last:border-0"
                    >
                      <td className="px-4 py-2 text-text-muted">{row.date}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{row.web}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{row.mobile}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-medium">{row.total}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
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
