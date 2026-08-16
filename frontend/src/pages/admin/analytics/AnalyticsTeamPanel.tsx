import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import type { TeamAnalytics } from '../../../hooks/use-analytics';

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-surface/50 px-4 py-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function AnalyticsTeamPanel({ data }: { data: TeamAnalytics }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Odigrano" value={data.played} />
        <Stat label="W–D–L" value={`${data.wins}–${data.draws}–${data.losses}`} />
        <Stat label="Golovi" value={`${data.goalsFor}:${data.goalsAgainst}`} />
        <Stat label="Pobjede %" value={`${data.winPercent}%`} />
      </div>
      <p className="text-sm text-text-muted">
        Forma:{' '}
        <span className="font-semibold tabular-nums text-text">{data.form.join(' ') || '—'}</span>
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Zadnje utakmice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0 text-sm">
          {data.recent.map((m) => (
            <p key={m.id}>
              {m.home} {m.status === 'FINISHED' ? `${m.homeScore}:${m.awayScore}` : '–'} {m.away}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
