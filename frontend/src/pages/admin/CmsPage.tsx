import { useState } from 'react';
import { asArray } from '../../lib/as-array';
import { useCmsBlocks } from '../../hooks';
import { useUpdateCmsBlock } from '../../hooks/use-cms-admin';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { CmsBlockEditor } from './CmsBlockEditor';
import type { CmsBlock } from '../../types';

export function CmsPage() {
  const { data, isLoading } = useCmsBlocks();
  const update = useUpdateCmsBlock();
  const [edit, setEdit] = useState<CmsBlock | null>(null);
  const [title, setTitle] = useState('');
  const blocks = asArray<CmsBlock>(data);

  const openEdit = (block: CmsBlock) => {
    setEdit(block);
    setTitle(block.title ?? '');
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
        {edit && (
          <CmsBlockEditor
            block={edit}
            title={title}
            onTitleChange={setTitle}
            isPending={update.isPending}
            onSave={(content) => {
              void update
                .mutateAsync({ id: edit.id, title, content })
                .then(() => setEdit(null));
            }}
          />
        )}
      </AdminFormSheet>
    </>
  );
}
