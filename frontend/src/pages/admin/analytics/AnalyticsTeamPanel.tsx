import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useTranslation } from 'react-i18next';
import type { TeamAnalytics } from '../../../hooks/use-analytics';

const FORM_STYLE: Record<string, string> = {
  W: 'bg-green-500/15 text-green-600 dark:text-green-400',
  D: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  L: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-surface/50 px-4 py-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('bs-BA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function AnalyticsTeamPanel({ data }: { data: TeamAnalytics }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t('admin.teamPanel.played')} value={data.played} />
        <Stat label="W–D–L" value={`${data.wins}–${data.draws}–${data.losses}`} />
        <Stat label={t('admin.teamPanel.goals')} value={`${data.goalsFor}:${data.goalsAgainst}`} />
        <Stat label={t('admin.teamPanel.winPercent')} value={`${data.winPercent}%`} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-text-muted">{t('admin.teamPanel.form')}</span>
        {data.form.length > 0 ? (
          data.form.map((f, i) => (
            <span
              key={i}
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${FORM_STYLE[f] ?? ''}`}
            >
              {f}
            </span>
          ))
        ) : (
          <span className="text-sm text-text-muted">—</span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('admin.teamPanel.recent')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-[var(--border-subtle)] text-sm">
            {data.recent.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-2.5">
                <span className="w-[40%] truncate text-right text-text-muted">{m.home}</span>
                <span className="mx-3 min-w-[48px] text-center font-bold tabular-nums text-text">
                  {m.status === 'FINISHED' ? `${m.homeScore}:${m.awayScore}` : fmt(m.scheduledAt)}
                </span>
                <span className="w-[40%] truncate text-left text-text-muted">{m.away}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
