import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTrophies } from '../../hooks';
import { useCreateTrophy, useDeleteTrophy } from '../../hooks/use-content-admin';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';

export function TrophiesAdminPage() {
  const { data, isLoading } = useTrophies();
  const create = useCreateTrophy();
  const remove = useDeleteTrophy();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [competition, setCompetition] = useState('');

  const onCreate = async () => {
    await create.mutateAsync({ name, year, competition: competition || undefined });
    setName('');
    setOpen(false);
  };

  return (
    <>
      <Seo title="Trofeji" />
      <AdminPageShell
        title="Trofeji"
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
            { key: 'year', header: 'Godina', render: (r) => r.year },
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
      <AdminFormSheet open={open} onOpenChange={setOpen} title="Novi trofej">
        <div className="space-y-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naziv" />
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            placeholder="Godina"
          />
          <Input
            value={competition}
            onChange={(e) => setCompetition(e.target.value)}
            placeholder="Takmičenje"
          />
          <Button onClick={() => void onCreate()} disabled={!name || create.isPending}>
            Kreiraj
          </Button>
        </div>
      </AdminFormSheet>
    </>
  );
}
