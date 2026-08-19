import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatDateTime } from '../../lib/utils';
import { AdminDataTable } from '../../components/admin/AdminPageShell';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { Badge } from '../../components/ui/badge';

interface FailedEmailRow {
  id: string;
  to: string;
  subject: string;
  error: string;
  createdAt: string;
}

interface EmailLogResponse {
  data: FailedEmailRow[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function EmailLogPanel() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['email-log', page],
    queryFn: async () =>
      (await api.get<EmailLogResponse>('/email-log', { params: { page, limit: 20 } })).data,
  });

  const rows = data?.data ?? [];

  if (isLoading) return <p className="p-4 text-sm text-text-muted">Učitavanje…</p>;

  if (!isLoading && rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-sm font-medium">Nema grešaka u slanju emailova</p>
        <p className="text-xs text-text-muted">Svi emailovi su uspješno isporučeni.</p>
      </div>
    );
  }

  return (
    <div>
      <AdminDataTable
        rows={rows}
        empty="Nema grešaka."
        columns={[
          { key: 'to', header: 'Prima', render: (r) => r.to },
          { key: 'subject', header: 'Predmet', render: (r) => r.subject },
          {
            key: 'error',
            header: 'Greška',
            render: (r) => (
              <Badge variant="danger" className="max-w-[280px] truncate text-xs">
                {r.error}
              </Badge>
            ),
          },
          { key: 'date', header: 'Datum', render: (r) => formatDateTime(r.createdAt) },
        ]}
      />
      {data?.meta && <AdminPagination meta={data.meta} page={page} onPageChange={setPage} />}
    </div>
  );
}
