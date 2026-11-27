'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '../../../lib/media';
import { getAuthHeader } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';

type NewsItem = { id: string; title: string; slug: string; status: string; category?: { name: string } | null };

async function fetchNews(status?: string): Promise<NewsItem[]> {
  const q = status ? `?status=${status}` : '';
  const res = await fetch(`${getApiUrl()}/news${q}`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Greška');
  const data = await res.json();
  return Array.isArray(data) ? data : data.items ?? [];
}

export default function VijestiAdminPage() {
  const { user } = useAuth();
  const canApprove = hasPermission(user?.permissions, 'news.approve');
  const canSubmit = hasPermission(user?.permissions, 'news.submit');
  const canManage = hasPermission(user?.permissions, 'news.manage');
  const [filter, setFilter] = useState<string>('');
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'news', filter],
    queryFn: () => fetchNews(filter || undefined),
  });

  const approve = useMutation({
    mutationFn: async (id: string) =>
      fetch(`${getApiUrl()}/news/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      }).then((r) => {
        if (!r.ok) throw new Error('Odobravanje nije uspjelo');
        return r.json();
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'news'] }),
  });

  const submit = useMutation({
    mutationFn: async (id: string) =>
      fetch(`${getApiUrl()}/news/${id}/submit`, {
        method: 'PATCH',
        headers: { ...getAuthHeader() },
      }).then((r) => {
        if (!r.ok) throw new Error('Predaja nije uspjela');
        return r.json();
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'news'] }),
  });

  const tabs: [string, string][] = [
    ['', 'Sve'],
    ['PENDING', 'Na čekanju'],
    ['PUBLISHED', 'Objavljeno'],
    ['DRAFT', 'Nacrt'],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Vijesti</h1>
        <p className="mt-1 text-sm text-text-muted">
          {canSubmit && !canApprove ? 'Writer 5 · news.manage + news.submit · predaja na odobrenje' : 'Moderator 27 · news.manage + news.approve · premium queue'}
          {canManage ? ' · +create' : ''}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tabs.map(([v, l]) => (
            <Button key={v} variant={filter === v ? 'premium' : 'outline'} size="sm" onClick={() => setFilter(v)}>
              {l}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            Osvježi
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-danger/20 bg-danger/10 p-6 text-center">
          <p className="text-sm text-text">Greška — `GET /news` zahtijeva `news.manage`</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
            Pokušaj ponovo
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {!data?.length ? (
            <Card className="p-8 text-center text-sm text-text-muted">Nema vijesti za filter.</Card>
          ) : (
            data.map((n) => (
              <Card key={n.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">{n.title}</CardTitle>
                  <p className="text-xs text-text-muted">
                    {n.category?.name ?? '—'} · {n.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  {n.status === 'PENDING' && canApprove ? (
                    <Button size="sm" variant="premium" disabled={approve.isPending} onClick={() => approve.mutate(n.id)}>
                      {approve.isPending ? '…' : 'Odobri i objavi'}
                    </Button>
                  ) : null}
                  {n.status === 'DRAFT' && canSubmit && !canApprove ? (
                    <Button size="sm" variant="outline" disabled={submit.isPending} onClick={() => submit.mutate(n.id)}>
                      Predaj na pregled
                    </Button>
                  ) : null}
                  {n.status === 'DRAFT' && canApprove ? (
                    <Button size="sm" variant="outline" disabled={approve.isPending} onClick={() => approve.mutate(n.id)}>
                      Objavi direktno
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" disabled>
                    Uredi
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Moderator queue</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-text-muted">P-DASH-02 · S-relaxed · premium · file &lt;200</CardContent>
      </Card>
    </div>
  );
}
