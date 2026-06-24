import { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePlayers } from '../../hooks';
import { useCreatePlayer } from '../../hooks/use-competition-admin';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';

export function PlayersAdminPage() {
  const { data, isLoading } = usePlayers();
  const create = useCreatePlayer();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('MF');

  const onCreate = async () => {
    await create.mutateAsync({ firstName, lastName, position });
    setFirstName('');
    setLastName('');
    setOpen(false);
  };

  return (
    <>
      <Seo title="Igrači" />
      <AdminPageShell
        title="Igrači"
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
            {
              key: 'name',
              header: 'Ime',
              render: (r) => `${r.firstName} ${r.lastName}`,
            },
            { key: 'position', header: 'Pozicija', render: (r) => r.position ?? '—' },
            { key: 'number', header: 'Broj', render: (r) => r.number ?? '—' },
          ]}
        />
      </AdminPageShell>
      <AdminFormSheet open={open} onOpenChange={setOpen} title="Novi igrač">
        <div className="space-y-4">
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ime" />
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Prezime" />
          <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Pozicija" />
          <Button onClick={() => void onCreate()} disabled={!firstName || !lastName || create.isPending}>
            Kreiraj
          </Button>
        </div>
      </AdminFormSheet>
    </>
  );
}
