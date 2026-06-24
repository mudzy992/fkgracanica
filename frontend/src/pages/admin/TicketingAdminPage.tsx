import { useTicketingOrders } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

interface Order {
  id: string;
  status?: string;
  totalAmount?: number;
}

export function TicketingAdminPage() {
  const { data, isLoading } = useTicketingOrders();
  const orders = (data as Order[] | undefined) ?? [];

  return (
    <>
      <Seo title="Ulaznice" />
      <AdminPageShell title="Ulaznice" isLoading={isLoading}>
        <AdminDataTable
          rows={orders}
          columns={[
            { key: 'id', header: 'ID', render: (r) => r.id.slice(0, 8) },
            { key: 'status', header: 'Status', render: (r) => r.status ?? '—' },
            { key: 'total', header: 'Iznos', render: (r) => r.totalAmount ?? '—' },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
