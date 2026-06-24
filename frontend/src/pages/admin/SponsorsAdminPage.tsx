import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useSponsors } from '../../hooks';
import { useCreateSponsor, useDeleteSponsor } from '../../hooks/use-content-admin';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';

const TIERS = ['GENERAL', 'GOLD', 'SILVER', 'BRONZE', 'PARTNER'];

export function SponsorsAdminPage() {
  const { data, isLoading } = useSponsors();
  const create = useCreateSponsor();
  const remove = useDeleteSponsor();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [tier, setTier] = useState('PARTNER');
  const [url, setUrl] = useState('');

  const onCreate = async () => {
    await create.mutateAsync({ name, tier, url: url || undefined });
    setName('');
    setUrl('');
    setOpen(false);
  };

  return (
    <>
      <Seo title="Sponzori" />
      <AdminPageShell
        title="Sponzori"
        isLoading={isLoading}
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Novi
          </Button>
        }
      >
        <AdminDataTable
          rows={data ?? []}
          columns={[
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'tier', header: 'Kategorija', render: (r) => r.tier },
            {
              key: 'actions',
              header: '',
              render: (r) => (
                <Button variant="ghost" size="icon" onClick={() => void remove.mutateAsync(r.id)}>
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              ),
            },
          ]}
        />
      </AdminPageShell>
      <AdminFormSheet open={open} onOpenChange={setOpen} title="Novi sponzor">
        <div className="space-y-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naziv" />
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (opcionalno)" />
          <Button onClick={() => void onCreate()} disabled={!name || create.isPending}>
            Kreiraj
          </Button>
        </div>
      </AdminFormSheet>
    </>
  );
}
