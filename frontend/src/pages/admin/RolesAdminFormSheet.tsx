import { useState } from 'react';
import { useCreateRole } from '../../hooks/use-users-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RolesAdminFormSheet({ open, onOpenChange }: Props) {
  const create = useCreateRole();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const save = async () => {
    await create.mutateAsync({ name, description: description || undefined });
    setName('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title="Nova uloga">
      <div className="space-y-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naziv *" />
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opis" />
        <Button onClick={() => void save()} disabled={!name || create.isPending}>
          Kreiraj
        </Button>
      </div>
    </AdminFormSheet>
  );
}
