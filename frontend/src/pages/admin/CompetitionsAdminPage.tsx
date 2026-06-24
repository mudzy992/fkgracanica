import { useCompetitions } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

interface Competition {
  id: string;
  name: string;
  slug: string;
}

export function CompetitionsAdminPage() {
  const { data, isLoading } = useCompetitions();
  const items = (data as Competition[] | undefined) ?? [];

  return (
    <>
      <Seo title="Takmičenja" />
      <AdminPageShell title="Takmičenja" isLoading={isLoading}>
        <AdminDataTable
          rows={items}
          columns={[
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'slug', header: 'Slug', render: (r) => r.slug },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
