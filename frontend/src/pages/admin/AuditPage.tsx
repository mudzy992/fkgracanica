import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuditLog } from '../../hooks';
import { auditActionLabel } from '../../lib/audit-action-labels';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

export function AuditPage() {
  const { t } = useTranslation();
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAuditLog({
    page,
    action: action || undefined,
    entity: entity || undefined,
    from: from || undefined,
    to: to || undefined,
  });
  const entries = data?.data ?? [];

  return (
    <>
      <Seo title={t('admin.auditPage.metaTitle')} />
      <AdminPageShell
        isError={isError}
        onRetry={() => void refetch()}
        title={t('admin.auditPage.title')}
        isLoading={isLoading}
      >
        <div className="grid gap-2 border-b border-[var(--border-subtle)] p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder={t('admin.auditPage.action')}
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
          <Input
            placeholder={t('admin.auditPage.entity')}
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
          />
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <AdminDataTable
          rows={entries}
          columns={[
            {
              key: 'action',
              header: t('admin.auditPage.action'),
              render: (r) => auditActionLabel(r.action),
            },
            {
              key: 'actor',
              header: t('admin.orderSheet.user'),
              render: (r) => r.actor?.email ?? '—',
            },
            { key: 'entity', header: t('admin.auditPage.entity'), render: (r) => r.entity ?? '—' },
            {
              key: 'date',
              header: t('admin.analyticsPanel.date'),
              render: (r) => formatDateTime(r.createdAt),
            },
          ]}
        />
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prethodna
            </Button>
            <span className="self-center text-sm">
              {page} / {data.meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sljedeća
            </Button>
          </div>
        )}
      </AdminPageShell>
    </>
  );
}
