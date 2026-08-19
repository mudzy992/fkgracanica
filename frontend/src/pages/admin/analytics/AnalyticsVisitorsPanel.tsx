import { useVisitorTrend, useVisitorTotals } from '../../../hooks/use-analytics';

export function AnalyticsVisitorsPanel() {
  const { data: totals, isLoading: totalsLoading } = useVisitorTotals(30);
  const { data: trend, isLoading: trendLoading } = useVisitorTrend(30);

  if (totalsLoading || trendLoading) {
    return <p className="text-sm text-text-muted">Učitavanje posjetilaca…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Web (30d)', value: totals?.web ?? 0 },
          { label: 'Mobile (30d)', value: totals?.mobile ?? 0 },
          { label: 'Ukupno (30d)', value: totals?.total ?? 0 },
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
          <h3 className="mb-3 text-sm font-semibold text-text-muted">Dnevni trend (30 dana)</h3>
          <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-text-muted">
                  <th className="px-4 py-2">Datum</th>
                  <th className="px-4 py-2 text-right">Web</th>
                  <th className="px-4 py-2 text-right">Mobile</th>
                  <th className="px-4 py-2 text-right">Ukupno</th>
                </tr>
              </thead>
              <tbody>
                {trend.slice().reverse().map((row) => (
                  <tr key={row.date} className="border-b border-[var(--border-subtle)] last:border-0">
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
    </div>
  );
}
