'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '../../../lib/media';
import { getAuthHeader } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';

type Match = { id: string; homeClub?: { name: string }; awayClub?: { name: string }; status: string; round?: { name: string } };

async function fetchMatches(): Promise<Match[]> {
  const res = await fetch(`${getApiUrl()}/matches`, { cache: 'no-store' });
  if (!res.ok) throw new Error('matches');
  const j = await res.json();
  return Array.isArray(j) ? j : j.items ?? [];
}

export default function LiveAdminPage() {
  const { user } = useAuth();
  const canLive = hasPermission(user?.permissions, 'live.manage');
  const canMatches = hasPermission(user?.permissions, 'matches.manage');
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'matches'],
    queryFn: fetchMatches,
  });

  const start = useMutation({
    mutationFn: async (id: string) =>
      fetch(`${getApiUrl()}/live/matches/${id}/start`, { method: 'POST', headers: getAuthHeader() }).then((r) => {
        if (!r.ok) throw new Error('start fail');
        return r.json();
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'matches'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Live</h1>
        <p className="mt-1 text-sm text-text-muted">Komentator 2 · live.manage + matches.manage · semafor</p>
        <div className="mt-3 flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            Osvježi
          </Button>
          {!canLive ? <span className="text-xs text-danger self-center">Nema dozvole live.manage</span> : null}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-danger/20 bg-danger/10 p-6 text-center">
          <p className="text-sm">Greška — `GET /matches`</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
            Pokušaj ponovo
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {!data?.length ? (
            <Card className="p-8 text-center text-sm text-text-muted">Nema utakmica.</Card>
          ) : (
            data.slice(0, 6).map((m) => (
              <Card key={m.id} className="flex items-center justify-between p-4">
                <div>
                  <CardTitle className="text-sm">
                    {m.homeClub?.name ?? '—'} : {m.awayClub?.name ?? '—'}
                  </CardTitle>
                  <p className="text-xs text-text-muted">
                    {m.round?.name ?? ''} · {m.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="premium" disabled={!canLive || start.isPending} onClick={() => start.mutate(m.id)}>
                    Start
                  </Button>
                  <Button size="sm" variant="outline" disabled={!canMatches}>
                    Postava
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Komentator — live.manage</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-text-muted">P-DASH-04 · S-relaxed · 6 matches preview</CardContent>
      </Card>
    </div>
  );
}
