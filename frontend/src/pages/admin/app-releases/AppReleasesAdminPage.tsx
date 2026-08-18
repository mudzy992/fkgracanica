import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Seo } from '../../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../../components/admin/AdminPageShell';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { api } from '../../../lib/api';
import { AppReleaseCreateForm } from './AppReleaseCreateForm';

type AppRelease = {
  id: string;
  version: string;
  versionCode: number;
  forceUpdate: boolean;
  status: string;
  publishedAt: string | null;
};

export function AppReleasesAdminPage() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['app-releases'],
    queryFn: async () => (await api.get<AppRelease[]>('/app-releases')).data,
  });
  const [uploading, setUploading] = useState(false);

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/app-releases', body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['app-releases'] }),
  });
  const publish = useMutation({
    mutationFn: (id: string) => api.patch(`/app-releases/${id}`, { status: 'PUBLISHED' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['app-releases'] }),
  });

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post<{ apkPath: string; apkSha256: string; apkSizeBytes: number }>(
        '/app-releases/upload',
        fd,
        { headers: { 'Content-Type': undefined } },
      );
      return data;
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Seo title="App release" />
      <AdminPageShell title="Android app release" isLoading={list.isLoading}>
        <AppReleaseCreateForm
          uploading={uploading}
          creating={create.isPending}
          onUpload={upload}
          onCreate={async (body) => {
            await create.mutateAsync(body);
          }}
        />
        <AdminDataTable
          rows={list.data ?? []}
          columns={[
            { key: 'version', header: 'Verzija', render: (r) => r.version },
            { key: 'code', header: 'Code', render: (r) => String(r.versionCode) },
            {
              key: 'status',
              header: 'Status',
              render: (r) => (
                <span className="flex items-center gap-2">
                  <Badge variant={r.status === 'PUBLISHED' ? 'success' : 'muted'}>{r.status}</Badge>
                  {r.forceUpdate ? <Badge variant="danger">Obavezno</Badge> : null}
                </span>
              ),
            },
            {
              key: 'actions',
              header: '',
              render: (r) =>
                r.status === 'DRAFT' ? (
                  <Button size="sm" disabled={publish.isPending} onClick={() => void publish.mutateAsync(r.id)}>
                    Objavi
                  </Button>
                ) : null,
            },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
