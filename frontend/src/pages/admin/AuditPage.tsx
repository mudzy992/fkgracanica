import { useState } from 'react';
import { useAuditLog } from '../../hooks';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

export function AuditPage() {
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLog({
    page,
    action: action || undefined,
    entity: entity || undefined,
    from: from || undefined,
    to: to || undefined,
  });
  const entries = data?.data ?? [];

  return (
    <>
      <Seo title="Audit" />
      <AdminPageShell title="Audit log" isLoading={isLoading}>
        <div className="grid gap-2 border-b border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input placeholder="Akcija" value={action} onChange={(e) => setAction(e.target.value)} />
          <Input placeholder="Entitet" value={entity} onChange={(e) => setEntity(e.target.value)} />
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <AdminDataTable
          rows={entries}
          columns={[
            { key: 'action', header: 'Akcija', render: (r) => r.action },
            { key: 'actor', header: 'Korisnik', render: (r) => r.actor?.email ?? '—' },
            { key: 'entity', header: 'Entitet', render: (r) => r.entity ?? '—' },
            { key: 'date', header: 'Datum', render: (r) => formatDateTime(r.createdAt) },
          ]}
        />
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prethodna
            </Button>
            <span className="self-center text-sm">{page} / {data.meta.totalPages}</span>
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
