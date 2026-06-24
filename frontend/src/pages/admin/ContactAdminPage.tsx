import { useContactMessages } from '../../hooks';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

export function ContactAdminPage() {
  const { data, isLoading } = useContactMessages();
  return (
    <>
      <Seo title="Kontakt" />
      <AdminPageShell title="Kontakt poruke" isLoading={isLoading}>
        <AdminDataTable
          rows={data ?? []}
          columns={[
            { key: 'name', header: 'Ime', render: (r) => r.name },
            { key: 'email', header: 'Email', render: (r) => r.email },
            { key: 'subject', header: 'Naslov', render: (r) => r.subject ?? '—' },
            {
              key: 'read',
              header: 'Pročitano',
              render: (r) => <Badge variant={r.isRead ? 'success' : 'muted'}>{r.isRead ? 'Da' : 'Ne'}</Badge>,
            },
            { key: 'date', header: 'Datum', render: (r) => formatDateTime(r.createdAt) },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
