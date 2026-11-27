'use client';

import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '../../../lib/media';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { Button } from '../../../components/ui/button';

type Payload = {
  overallPercent: number;
  counted: number;
  afterLaunch: number;
  counts: Record<string, number>;
  modules: { id: string; title: string; percent: number; badge: string; surfaces: string[]; summary: string }[];
};

async function fetchStatus(): Promise<Payload | null> {
  try {
    const m = typeof document !== 'undefined' ? document.cookie.match(/(?:^|; )fk_access_token=([^;]*)/) : null;
    const headers: Record<string, string> = {};
    if (m) headers.Authorization = `Bearer ${decodeURIComponent(m[1])}`;
    const res = await fetch(`${getApiUrl()}/platform-status`, { headers, cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as Payload;
  } catch {
    return null;
  }
}

function PercentRing({ percent }: { percent: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div
      className="relative shrink-0 text-primary-light"
      style={{ width: 120, height: 120 }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${percent}%`}
    >
      <svg width={120} height={120} viewBox="0 0 140 140" className="-rotate-90" aria-hidden>
        <circle cx="70" cy="70" r={54} fill="none" stroke="var(--border-subtle)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={54}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <p className="absolute inset-0 grid place-items-center font-display text-2xl font-bold tabular-nums text-text">
        {percent}%
      </p>
    </div>
  );
}

export default function StanjePage() {
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['admin', 'platform-status'],
    queryFn: fetchStatus,
  });

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Stanje platforme</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">Premium • dashboard.read · ISR off · stale 30s</p>
        {lastUpdated ? (
          <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
            <span>Ažurirano u {lastUpdated}</span>
            <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
              {isFetching ? 'Učitavanje…' : 'Osvježi'}
            </Button>
          </div>
        ) : null}
      </div>

      {isError ? (
        <div role="alert" className="flex flex-col items-center gap-4 rounded-2xl border border-danger/20 bg-danger/10 py-12">
          <p className="text-text-muted">Greška — `GET /platform-status` zahtijeva `dashboard.read`</p>
          <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            Pokušaj ponovo
          </Button>
        </div>
      ) : isLoading || !data ? (
        <div aria-busy="true" className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row">
              <div className="flex flex-col items-center gap-2">
                <PercentRing percent={data.overallPercent} />
                <p className="max-w-[12rem] text-center text-xs uppercase tracking-wider text-text-muted">
                  Ukupan napredak
                </p>
              </div>
              <div className="grid w-full flex-1 gap-3 sm:grid-cols-2">
                <Card className="border-[var(--border-subtle)] bg-surface/50 px-4 py-3">
                  <p className="text-xs text-text-muted">Broj modula</p>
                  <p className="mt-1 font-display text-2xl font-bold tabular-nums">{data.counted}</p>
                </Card>
                <Card className="border-[var(--border-subtle)] bg-surface/50 px-4 py-3">
                  <p className="text-xs text-text-muted">Nakon lansiranja</p>
                  <p className="mt-1 font-display text-2xl font-bold tabular-nums">{data.afterLaunch}</p>
                </Card>
                <Card className="border-[var(--border-subtle)] bg-surface/50 px-4 py-3">
                  <p className="text-xs text-text-muted">Spremno</p>
                  <p className="mt-1 font-display text-2xl font-bold tabular-nums">{data.counts.ready ?? 0}</p>
                </Card>
                <Card className="border-[var(--border-subtle)] bg-surface/50 px-4 py-3">
                  <p className="text-xs text-text-muted">U toku</p>
                  <p className="mt-1 font-display text-2xl font-bold tabular-nums">{data.counts.in_progress ?? 0}</p>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.modules.slice(0, 4).map((m) => (
              <Card key={m.id} className="flex h-full flex-col">
                <CardHeader className="flex-row items-baseline justify-between space-y-0">
                  <CardTitle className="text-sm font-semibold">{m.title}</CardTitle>
                  <span className="text-xs text-text-muted">{m.percent}%</span>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${m.percent}%` }} />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-text-muted">{m.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
