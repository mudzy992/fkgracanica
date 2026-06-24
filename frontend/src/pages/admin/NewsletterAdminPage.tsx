import { useNewsletterSubscribers } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
}

export function NewsletterAdminPage() {
  const { data, isLoading } = useNewsletterSubscribers();
  const subs = (data as Subscriber[] | undefined) ?? [];

  return (
    <>
      <Seo title="Newsletter" />
      <AdminPageShell title="Newsletter pretplatnici" isLoading={isLoading}>
        <AdminDataTable
          rows={subs}
          columns={[
            { key: 'email', header: 'Email', render: (r) => r.email },
            { key: 'active', header: 'Aktivan', render: (r) => (r.isActive ? 'Da' : 'Ne') },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
