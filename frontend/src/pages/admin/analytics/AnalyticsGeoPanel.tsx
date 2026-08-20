const COUNTRY_LABELS: Record<string, string> = {
  BA: 'Bosna i Hercegovina',
  HR: 'Hrvatska',
  RS: 'Srbija',
  ME: 'Crna Gora',
  DE: 'Njemačka',
  AT: 'Austrija',
  CH: 'Švicarska',
  US: 'SAD',
  GB: 'Ujedinjeno Kraljevstvo',
};

function countryLabel(code: string): string {
  return COUNTRY_LABELS[code] ?? code;
}

type GeoRow = { countryCode: string; count: number; percent: number };

export function AnalyticsGeoPanel({ rows }: { rows: GeoRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        Nema geo podataka za odabrani period (potrebna primjena migracije i novi posjeti).
      </p>
    );
  }

  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.countryCode} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium">{countryLabel(row.countryCode)}</span>
              <span className="tabular-nums text-text-muted">
                {row.count} · {row.percent}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface/80">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${Math.max(4, Math.round((row.count / max) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
