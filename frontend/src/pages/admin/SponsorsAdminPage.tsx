import { useSponsors } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

export function SponsorsAdminPage() {
  const { data, isLoading } = useSponsors();
  return (
    <>
      <Seo title="Sponzori" />
      <AdminPageShell title="Sponzori" isLoading={isLoading}>
        <AdminDataTable
          rows={data ?? []}
          columns={[
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'tier', header: 'Nivo', render: (r) => r.tier },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
