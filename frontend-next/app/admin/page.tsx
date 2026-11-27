'use client';

import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '../../lib/media';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../lib/auth';

type Kpis = Record<string, number>;

async function fetchKpis(token?: string): Promise<Kpis | null> {
  try {
    const headers: Record<string, string> = {};
    if (typeof document !== 'undefined') {
      const m = document.cookie.match(/(?:^|; )fk_access_token=([^;]*)/);
      if (m) headers.Authorization = `Bearer ${decodeURIComponent(m[1])}`;
    } else if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${getApiUrl()}/dashboard/kpis`, { headers, cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as Kpis;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['admin', 'dashboard', 'kpis'],
    queryFn: () => fetchKpis(),
    enabled: !!user,
  });

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  if (authLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Kontrolna tabla</h1>
        <p className="mt-1 text-sm text-text-muted">
          Premium • Administrator {user ? `· ${user.email}` : ''} · 40 dozvola
        </p>
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
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger/10 p-6 text-center">
          <p className="text-sm text-text">Greška pri učitavanju KPI — provjerite `GET /dashboard/kpis` (dashboard.read)</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()} disabled={isFetching}>
            Pokušaj ponovo
          </Button>
        </div>
      ) : isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-[118px]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-3 h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(data).slice(0, 8).map(([k, v]) => (
            <Card key={k} className="transition-colors hover:border-primary/25">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-text-muted">{k}</CardTitle>
                <span className="text-xs text-text-muted">KPI</span>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums text-primary-light">{String(v)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Brze akcije</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Osvježi KPI
          </Button>
          <Button variant="premium" size="sm">
            + Nova vijest
          </Button>
          <span className="text-xs text-text-muted self-center">P-DASH-01 · S-relaxed · premium</span>
        </CardContent>
      </Card>
    </div>
  );
}
