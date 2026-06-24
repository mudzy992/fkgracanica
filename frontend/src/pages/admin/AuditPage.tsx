import { useAuditLog } from '../../hooks';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

interface AuditEntry {
  id: string;
  action: string;
  createdAt: string;
  actorId?: string | null;
}

export function AuditPage() {
  const { data, isLoading } = useAuditLog();
  const entries = (data as AuditEntry[] | undefined) ?? [];

  return (
    <>
      <Seo title="Audit" />
      <AdminPageShell title="Audit log" isLoading={isLoading}>
        <AdminDataTable
          rows={entries}
          columns={[
            { key: 'action', header: 'Akcija', render: (r) => r.action },
            { key: 'actor', header: 'Korisnik', render: (r) => r.actorId ?? '—' },
            { key: 'date', header: 'Datum', render: (r) => formatDateTime(r.createdAt) },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
