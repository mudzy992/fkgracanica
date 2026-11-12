import { Card } from '../../../components/ui/card';
import type { VisitorTrendRow } from '../../../hooks/use-analytics';

const BAR_COLORS = {
  web: 'bg-blue-500/70',
  mobile: 'bg-primary/70',
  total: 'bg-accent/70',
} as const;

function barHeight(value: number, max: number): string {
  if (max <= 0 || value <= 0) return '0%';
  return `${Math.max(4, Math.round((value / max) * 100))}%`;
}

export function AnalyticsVisitorsTrendChart({ trend }: { trend: VisitorTrendRow[] }) {
  const rows = trend.slice().reverse();
  const maxTotal = Math.max(...rows.map((r) => r.total), 1);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-sm ${BAR_COLORS.web}`} /> Web
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-sm ${BAR_COLORS.mobile}`} /> Mobile
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-sm ${BAR_COLORS.total}`} /> Ukupno
        </span>
      </div>
      <Card className="p-4">
        <div className="flex min-w-[640px] items-end gap-2" style={{ height: '12rem' }}>
          {rows.map((row) => (
            <div key={row.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="flex h-full w-full items-end justify-center gap-0.5">
                {(['web', 'mobile', 'total'] as const).map((key) => (
                  <div
                    key={key}
                    className={`w-2 rounded-t-sm ${BAR_COLORS[key]}`}
                    style={{ height: barHeight(row[key], maxTotal) }}
                    title={`${key}: ${row[key]}`}
                  />
                ))}
              </div>
              <span className="truncate text-[10px] text-text-muted">{row.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
