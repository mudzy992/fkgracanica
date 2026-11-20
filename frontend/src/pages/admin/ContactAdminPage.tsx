import { useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import {
  useContactMessages,
  useDeleteContact,
  useMarkAllContactRead,
  useMarkContactRead,
} from '../../hooks/use-contact-admin';
import { useConfirm } from '../../hooks/use-confirm';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { ContactMessageSheet } from './ContactMessageSheet';
import type { ContactMessage } from '../../types';
import { runAction } from '../../lib/action-errors';

interface Props {
  embedded?: boolean;
}

export function ContactAdminPage({ embedded = false }: Props) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useContactMessages({
    page,
    search: search || undefined,
    unreadOnly,
  });
  const markRead = useMarkContactRead();
  const markAllRead = useMarkAllContactRead();
  const remove = useDeleteContact();
  const { confirm, dialog } = useConfirm();
  const rows = data?.data ?? [];
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;
  const emptyLabel = t('admin.contactPage.empty', { defaultValue: 'Nema poruka.' }) as string;

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.isRead) void runAction(markRead.mutateAsync(msg.id));
  };

  const onDelete = async (msg: ContactMessage, e: MouseEvent) => {
    e.stopPropagation();
    const ok = await confirm({
      title: t('admin.contactPage.deleteTitle', { defaultValue: 'Obrisati poruku?' }) as string,
      description: t('admin.contactPage.deleteDesc', { defaultValue: `Od: ${msg.name}`, name: msg.name }) as string,
      variant: 'danger',
      confirmLabel: t('admin.common.delete', { defaultValue: 'Obriši' }) as string,
    });
    if (ok) void runAction(remove.mutateAsync(msg.id));
  };

  const markAllLabel = t('admin.contactPage.markAllRead', { defaultValue: 'Označi sve pročitanim' }) as string;
  const unreadOnlyLabel = t('admin.contactPage.unreadOnly', { defaultValue: 'Samo nepročitane' }) as string;

  const markAllAction = (
    <Button
      size="sm"
      variant="outline"
      onClick={() => void runAction(markAllRead.mutateAsync())}
      disabled={markAllRead.isPending || Boolean(isFetching)}
    >
      {markAllLabel}
    </Button>
  );

  const filterBar = (
    <div className="flex flex-wrap gap-3 border-b border-[var(--border-subtle)] p-4">
      <Input
        className="max-w-xs"
        placeholder={t('admin.contactPage.searchPlaceholder', { defaultValue: 'Pretraži' }) as string}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      <Button
        size="sm"
        variant={unreadOnly ? 'default' : 'outline'}
        onClick={() => {
          setUnreadOnly((v) => !v);
          setPage(1);
        }}
        disabled={Boolean(isFetching)}
      >
        {unreadOnlyLabel}
      </Button>
    </div>
  );

  const table = (
    <AdminDataTable
      rows={rows}
      onRowClick={openMessage}
      empty={emptyLabel}
      emptyRole="status"
      columns={[
        { key: 'name', header: t('admin.contactPage.header.name', { defaultValue: 'Ime' }) as string, render: (r) => r.name },
        { key: 'email', header: t('admin.contactPage.header.email', { defaultValue: 'Email' }) as string, render: (r) => r.email },
        { key: 'subject', header: t('admin.contactPage.header.subject', { defaultValue: 'Naslov' }) as string, render: (r) => r.subject ?? '—' },
        {
          key: 'read',
          header: t('admin.contactPage.header.status', { defaultValue: 'Status' }) as string,
          render: (r) => (
            <Badge variant={r.isRead ? 'success' : 'default'}>
              {r.isRead
                ? (t('admin.contactPage.read', { defaultValue: 'Pročitano' }) as string)
                : (t('admin.contactPage.new', { defaultValue: 'Novo' }) as string)}
            </Badge>
          ),
        },
        { key: 'date', header: t('admin.contactPage.header.date', { defaultValue: 'Datum' }) as string, render: (r) => formatDateTime(r.createdAt) },
        {
          key: 'actions',
          header: t('admin.common.actions', { defaultValue: 'Akcije' }) as string,
          render: (r) => (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => void onDelete(r, e)}
              aria-label={t('actions.delete') as string}
              disabled={remove.isPending || Boolean(isFetching)}
            >
              <Trash2 className="h-4 w-4 text-danger" />
            </Button>
          ),
        },
      ]}
    />
  );

  const pagination = data?.meta ? (
    <AdminPagination meta={data.meta} page={page} onPageChange={setPage} isFetching={Boolean(isFetching)} />
  ) : null;

  const lastUpdatedBar = lastUpdated ? (
    <div className="mb-3 flex items-center justify-end gap-3 px-4 pt-4 text-xs text-text-muted">
      <span>{t('admin.home.lastUpdated', { defaultValue: 'Ažurirano u {{time}}', time: lastUpdated })}</span>
      <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={Boolean(isFetching)}>
        {isFetching
          ? (t('admin.common.loading', { defaultValue: 'Učitavanje…' }) as string)
          : (t('admin.home.refresh', { defaultValue: 'Osvježi' }) as string)}
      </Button>
    </div>
  ) : null;

  const embeddedBody = (
    <>
      {embedded && (
        <div className="flex justify-end border-b border-[var(--border-subtle)] p-4">
          {markAllAction}
        </div>
      )}
      {isError ? (
        <div role="alert" className="flex flex-col gap-3 p-4">
          <p className="text-sm text-danger">{t('admin.common.loadError', { defaultValue: 'Greška pri učitavanju.' })}</p>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={Boolean(isFetching)}>
            {isFetching
              ? (t('admin.common.loading', { defaultValue: 'Učitavanje…' }) as string)
              : (t('admin.common.retry', { defaultValue: 'Pokušaj ponovo' }) as string)}
          </Button>
        </div>
      ) : isLoading ? (
        <div aria-busy="true" className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
          <p className="sr-only">{t('admin.common.loading', { defaultValue: 'Učitavanje…' })}</p>
        </div>
      ) : (
        <>
          {lastUpdatedBar}
          {filterBar}
          {table}
          {pagination}
        </>
      )}
    </>
  );

  const shellBody = (
    <>
      {filterBar}
      {table}
      {pagination}
    </>
  );

  const sheet = (
    <ContactMessageSheet
      message={selected}
      open={!!selected}
      onOpenChange={(o) => !o && setSelected(null)}
      onMarkRead={(id) => void runAction(markRead.mutateAsync(id))}
      isMarking={markRead.isPending || Boolean(isFetching)}
    />
  );

  if (embedded) {
    return (
      <>
        {dialog}
        {embeddedBody}
        {sheet}
      </>
    );
  }

  return (
    <>
      <Seo title={t('admin.contact', { defaultValue: 'Kontakt' }) as string} />
      {dialog}
      <AdminPageShell
        isError={isError}
        onRetry={() => void refetch()}
        title={t('admin.contactPage.title', { defaultValue: 'Kontakt poruke' }) as string}
        isLoading={isLoading}
        isFetching={isFetching}
        dataUpdatedAt={dataUpdatedAt}
        onRefresh={() => void refetch()}
        actions={markAllAction}
      >
        {shellBody}
      </AdminPageShell>
      {sheet}
    </>
  );
}
