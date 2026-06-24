import { useState } from 'react';
import { useCmsBlocks } from '../../hooks';
import { useUpdateCmsBlock } from '../../hooks/use-cms-admin';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import type { CmsBlock } from '../../types';

export function CmsPage() {
  const { data, isLoading } = useCmsBlocks();
  const update = useUpdateCmsBlock();
  const [edit, setEdit] = useState<CmsBlock | null>(null);
  const [title, setTitle] = useState('');
  const [json, setJson] = useState('{}');
  const blocks = (data as CmsBlock[] | undefined) ?? [];

  const openEdit = (block: CmsBlock) => {
    setEdit(block);
    setTitle(block.title ?? '');
    setJson(JSON.stringify(block.content ?? {}, null, 2));
  };

  const save = async () => {
    if (!edit) return;
    await update.mutateAsync({
      id: edit.id,
      title,
      content: JSON.parse(json) as Record<string, unknown>,
    });
    setEdit(null);
  };

  return (
    <>
      <Seo title="CMS" />
      <AdminPageShell title="CMS blokovi" isLoading={isLoading}>
        <AdminDataTable
          rows={blocks}
          columns={[
            { key: 'key', header: 'Ključ', render: (r) => r.key },
            { key: 'title', header: 'Naslov', render: (r) => r.title ?? '—' },
            {
              key: 'actions',
              header: '',
              render: (r) => (
                <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                  Uredi
                </Button>
              ),
            },
          ]}
        />
      </AdminPageShell>
      <AdminFormSheet open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={`Uredi: ${edit?.key ?? ''}`}>
        <div className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Naslov" />
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-slate-200 bg-background p-2 font-mono text-xs"
          />
          <Button onClick={() => void save()} disabled={update.isPending}>
            Sačuvaj
          </Button>
        </div>
      </AdminFormSheet>
    </>
  );
}
