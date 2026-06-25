import { useState } from 'react';
import { useNewsletterSubscribers, useUnsubscribeNewsletter } from '../../hooks/use-newsletter-admin';
import { useConfirm } from '../../hooks/use-confirm';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminPagination } from '../../components/admin/AdminPagination';

export function NewsletterAdminPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useNewsletterSubscribers({ page, search: search || undefined });
  const unsubscribe = useUnsubscribeNewsletter();
  const { confirm, dialog } = useConfirm();
  const rows = data?.data ?? [];

  const onUnsubscribe = async (email: string) => {
    const ok = await confirm({
      title: 'Odjaviti pretplatnika?',
      description: email,
      confirmLabel: 'Odjavi',
      variant: 'danger',
    });
    if (ok) void unsubscribe.mutateAsync(email);
  };

  return (
    <>
      <Seo title="Newsletter" />
      {dialog}
      <AdminPageShell title="Newsletter pretplatnici" isLoading={isLoading}>
        <div className="border-b border-slate-200 p-4">
          <Input
            className="max-w-xs"
            placeholder="Pretraži email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <AdminDataTable
          rows={rows}
          empty="Nema pretplatnika."
          columns={[
            { key: 'email', header: 'Email', render: (r) => r.email },
            {
              key: 'active',
              header: 'Status',
              render: (r) => (
                <Badge variant={r.isActive ? 'success' : 'muted'}>{r.isActive ? 'Aktivan' : 'Neaktivan'}</Badge>
              ),
            },
            { key: 'date', header: 'Prijavljen', render: (r) => formatDateTime(r.createdAt) },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) =>
                r.isActive ? (
                  <Button size="sm" variant="outline" onClick={() => void onUnsubscribe(r.email)} disabled={unsubscribe.isPending}>
                    Odjavi
                  </Button>
                ) : null,
            },
          ]}
        />
        {data?.meta && <AdminPagination meta={data.meta} page={page} onPageChange={setPage} />}
      </AdminPageShell>
    </>
  );
}
