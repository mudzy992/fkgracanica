import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNewsList } from '../../hooks';
import { useDeleteNews, useUpdateNewsStatus } from '../../hooks/use-news-admin';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { NewsAdminFormSheet } from './NewsAdminFormSheet';
import type { ContentStatus, NewsItem } from '../../types';

function statusVariant(status: ContentStatus): 'default' | 'muted' {
  if (status === 'PUBLISHED') return 'default';
  return 'muted';
}

export function NewsAdminPage() {
  const { data, isLoading } = useNewsList();
  const updateStatus = useUpdateNewsStatus();
  const deleteNews = useDeleteNews();
  const [formOpen, setFormOpen] = useState(false);

  const publish = (item: NewsItem) => {
    void updateStatus.mutateAsync({ id: item.id, status: 'PUBLISHED' });
  };

  const archive = (item: NewsItem) => {
    void updateStatus.mutateAsync({ id: item.id, status: 'ARCHIVED' });
  };

  const remove = (item: NewsItem) => {
    if (window.confirm(`Obrisati "${item.title}"?`)) void deleteNews.mutateAsync(item.id);
  };

  return (
    <>
      <Seo title="Vijesti" />
      <AdminPageShell
        title="Vijesti"
        isLoading={isLoading}
        actions={<Button onClick={() => setFormOpen(true)}>Nova vijest</Button>}
      >
        <AdminDataTable
          rows={data ?? []}
          empty="Nema vijesti — kreirajte prvu."
          columns={[
            { key: 'title', header: 'Naslov', render: (r) => r.title },
            {
              key: 'status',
              header: 'Status',
              render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge>,
            },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) => (
                <div className="flex flex-wrap gap-2">
                  {r.status !== 'PUBLISHED' && (
                    <Button size="sm" onClick={() => publish(r)} disabled={updateStatus.isPending}>
                      Objavi
                    </Button>
                  )}
                  {r.status === 'PUBLISHED' && (
                    <Link to={`/vijesti/${r.slug}`} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">
                        Pregled
                      </Button>
                    </Link>
                  )}
                  {r.status === 'PUBLISHED' && (
                    <Button size="sm" variant="ghost" onClick={() => archive(r)}>
                      Arhiviraj
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => remove(r)}>
                    Obriši
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </AdminPageShell>
      <NewsAdminFormSheet open={formOpen} onOpenChange={setFormOpen} />
    </>
  );
}
