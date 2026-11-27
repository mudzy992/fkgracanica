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

type GalleryItem = { id: string; title: string; status: string };

async function fetchGallery(status?: string): Promise<GalleryItem[]> {
  const q = status ? `?status=${status}` : '';
  const res = await fetch(`${getApiUrl()}/gallery${q}`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Greška');
  const j = await res.json();
  return Array.isArray(j) ? j : j.items ?? [];
}

export default function GalerijaAdminPage() {
  const { user } = useAuth();
  const canApprove = hasPermission(user?.permissions, 'gallery.approve');
  const [filter, setFilter] = useState('');
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'gallery', filter],
    queryFn: () => fetchGallery(filter || undefined),
  });

  const approve = useMutation({
    mutationFn: async (id: string) =>
      fetch(`${getApiUrl()}/gallery/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      }).then((r) => {
        if (!r.ok) throw new Error('approve fail');
        return r.json();
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'gallery'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Galerija</h1>
        <p className="mt-1 text-sm text-text-muted">Moderator 27 · gallery.manage + gallery.approve</p>
        <div className="mt-3 flex gap-2">
          {[
            ['', 'Sve'],
            ['PENDING', 'Na čekanju'],
            ['PUBLISHED', 'Objavljeno'],
          ].map(([v, l]) => (
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
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-danger/20 bg-danger/10 p-6 text-center">
          <p className="text-sm">Greška — `GET /gallery` zahtijeva `gallery.manage`</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
            Pokušaj ponovo
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {!data?.length ? (
            <Card className="p-8 text-center text-sm text-text-muted">Nema albuma.</Card>
          ) : (
            data.map((g) => (
              <Card key={g.id} className="flex items-center justify-between p-4">
                <div>
                  <CardTitle className="text-sm">{g.title}</CardTitle>
                  <p className="text-xs text-text-muted">{g.status}</p>
                </div>
                {g.status !== 'PUBLISHED' && canApprove ? (
                  <Button size="sm" variant="premium" disabled={approve.isPending} onClick={() => approve.mutate(g.id)}>
                    Objavi
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    Uredi
                  </Button>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">S-relaxed · premium · gallery queue</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-text-muted">P-DASH-02 · Moderator 27</CardContent>
      </Card>
    </div>
  );
}
