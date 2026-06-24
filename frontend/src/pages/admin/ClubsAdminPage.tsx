import { useClubs } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

export function ClubsAdminPage() {
  const { data, isLoading } = useClubs();
  return (
    <>
      <Seo title="Klubovi" />
      <AdminPageShell title="Klubovi" isLoading={isLoading}>
        <AdminDataTable
          rows={data ?? []}
          columns={[
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'city', header: 'Grad', render: (r) => r.city ?? '—' },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
