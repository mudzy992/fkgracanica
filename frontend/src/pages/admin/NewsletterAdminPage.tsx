import { useState } from 'react';
import {
  useNewsletterSubscribers,
  useUnsubscribeNewsletter,
} from '../../hooks/use-newsletter-admin';
import { useConfirm } from '../../hooks/use-confirm';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { api } from '../../lib/api';
import { NewsletterCampaignPanel } from '../../components/newsletter/NewsletterCampaignPanel';

interface Props {
  embedded?: boolean;
}

export function NewsletterAdminPage({ embedded = false }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'list' | 'campaigns'>('list');
  const { data, isLoading, isError, refetch } = useNewsletterSubscribers({
    page,
    search: search || undefined,
  });
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

  const body = (
    <>
      <div className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] px-4 pt-4">
        <Button
          size="sm"
          variant={tab === 'list' ? 'default' : 'outline'}
          onClick={() => setTab('list')}
        >
          Pretplatnici
        </Button>
        <Button
          size="sm"
          variant={tab === 'campaigns' ? 'default' : 'outline'}
          onClick={() => setTab('campaigns')}
        >
          Kampanje
        </Button>
      </div>
      {tab === 'campaigns' ? (
        <NewsletterCampaignPanel />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] p-4">
            <Input
              className="max-w-xs"
              placeholder="Pretraži email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const res = await api.get('/newsletter/export/csv', { responseType: 'blob' });
                const url = URL.createObjectURL(res.data as Blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'newsletter.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export CSV
            </Button>
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
                  <Badge variant={r.isActive ? 'success' : 'muted'}>
                    {r.isActive ? 'Aktivan' : 'Neaktivan'}
                  </Badge>
                ),
              },
              { key: 'date', header: 'Prijavljen', render: (r) => formatDateTime(r.createdAt) },
              {
                key: 'actions',
                header: 'Akcije',
                render: (r) =>
                  r.isActive ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void onUnsubscribe(r.email)}
                      disabled={unsubscribe.isPending}
                    >
                      Odjavi
                    </Button>
                  ) : null,
              },
            ]}
          />
          {data?.meta && <AdminPagination meta={data.meta} page={page} onPageChange={setPage} />}
        </>
      )}
    </>
  );

  if (embedded) {
    return (
      <>
        {dialog}
        {body}
      </>
    );
  }

  return (
    <>
      <Seo title="Newsletter" />
      {dialog}
      <AdminPageShell
        isError={isError}
        onRetry={() => void refetch()}
        title="Newsletter pretplatnici"
        isLoading={isLoading}
      >
        {body}
      </AdminPageShell>
    </>
  );
}
