import { useState, type MouseEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useContactMessages, useDeleteContact, useMarkAllContactRead, useMarkContactRead } from '../../hooks/use-contact-admin';
import { useConfirm } from '../../hooks/use-confirm';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { ContactMessageSheet } from './ContactMessageSheet';
import type { ContactMessage } from '../../types';

interface Props {
  embedded?: boolean;
}

export function ContactAdminPage({ embedded = false }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const { data, isLoading } = useContactMessages({ page, search: search || undefined, unreadOnly });
  const markRead = useMarkContactRead();
  const markAllRead = useMarkAllContactRead();
  const remove = useDeleteContact();
  const { confirm, dialog } = useConfirm();
  const rows = data?.data ?? [];

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.isRead) void markRead.mutateAsync(msg.id);
  };

  const onDelete = async (msg: ContactMessage, e: MouseEvent) => {
    e.stopPropagation();
    const ok = await confirm({
      title: 'Obrisati poruku?',
      description: `Od: ${msg.name}`,
      variant: 'danger',
      confirmLabel: 'Obriši',
    });
    if (ok) void remove.mutateAsync(msg.id);
  };

  const markAllAction = (
    <Button size="sm" variant="outline" onClick={() => void markAllRead.mutateAsync()} disabled={markAllRead.isPending}>
      Označi sve pročitanim
    </Button>
  );

  const body = (
    <>
      {embedded && (
        <div className="flex justify-end border-b border-[var(--border-subtle)] p-4">
          {markAllAction}
        </div>
      )}
      <div className="flex flex-wrap gap-3 border-b border-[var(--border-subtle)] p-4">
        <Input
          className="max-w-xs"
          placeholder="Pretraži..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <Button size="sm" variant={unreadOnly ? 'default' : 'outline'} onClick={() => { setUnreadOnly((v) => !v); setPage(1); }}>
          Samo nepročitane
        </Button>
      </div>
      <AdminDataTable
        rows={rows}
        onRowClick={openMessage}
        empty="Nema poruka."
        columns={[
          { key: 'name', header: 'Ime', render: (r) => r.name },
          { key: 'email', header: 'Email', render: (r) => r.email },
          { key: 'subject', header: 'Naslov', render: (r) => r.subject ?? '—' },
          {
            key: 'read',
            header: 'Status',
            render: (r) => (
              <Badge variant={r.isRead ? 'success' : 'default'}>{r.isRead ? 'Pročitano' : 'Novo'}</Badge>
            ),
          },
          { key: 'date', header: 'Datum', render: (r) => formatDateTime(r.createdAt) },
          {
            key: 'actions',
            header: '',
            render: (r) => (
              <Button variant="ghost" size="icon" onClick={(e) => void onDelete(r, e)}>
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            ),
          },
        ]}
      />
      {data?.meta && <AdminPagination meta={data.meta} page={page} onPageChange={setPage} />}
    </>
  );

  const sheet = (
    <ContactMessageSheet
      message={selected}
      open={!!selected}
      onOpenChange={(o) => !o && setSelected(null)}
      onMarkRead={(id) => void markRead.mutateAsync(id)}
      isMarking={markRead.isPending}
    />
  );

  if (embedded) {
    return (
      <>
        {dialog}
        {body}
        {sheet}
      </>
    );
  }

  return (
    <>
      <Seo title="Kontakt" />
      {dialog}
      <AdminPageShell title="Kontakt poruke" isLoading={isLoading} actions={markAllAction}>
        {body}
      </AdminPageShell>
      {sheet}
    </>
  );
}
