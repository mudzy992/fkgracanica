'use client';

import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '../../../lib/media';
import { getAuthHeader } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';

type MediaAsset = { id: string; fileName: string; url: string; mimeType: string };

async function fetchAssets(): Promise<MediaAsset[]> {
  const res = await fetch(`${getApiUrl()}/media/assets`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('media read');
  const j = await res.json();
  return Array.isArray(j) ? j : j.items ?? j.assets ?? [];
}

export default function MedijiAdminPage() {
  const { user } = useAuth();
  const canUpload = hasPermission(user?.permissions, 'media.upload') || hasPermission(user?.permissions, 'media.manage');
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'media', 'assets'],
    queryFn: fetchAssets,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Mediji</h1>
        <p className="mt-1 text-sm text-text-muted">Writer 5 · media.read + media.upload · biblioteka slika</p>
        <div className="mt-3 flex gap-2">
          <Button variant="premium" size="sm" disabled={!canUpload}>
            {canUpload ? 'Upload (uskoro)' : 'Nema dozvole za upload'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            Osvježi
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-danger/20 bg-danger/10 p-6 text-center">
          <p className="text-sm">Greška — `GET /media/assets` zahtijeva `media.read`</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
            Pokušaj ponovo
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {!data?.length ? (
            <Card className="p-8 text-center text-sm text-text-muted sm:col-span-2">Nema medija — uploadajte prvu sliku.</Card>
          ) : (
            data.slice(0, 8).map((m) => (
              <Card key={m.id} className="p-4">
                <CardTitle className="text-sm">{m.fileName}</CardTitle>
                <p className="text-xs text-text-muted">{m.mimeType}</p>
              </Card>
            ))
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Writer — media.upload</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-text-muted">P-DASH-03 · S-relaxed · premium · file &lt;200</CardContent>
      </Card>
    </div>
  );
}
