import { useEffect, useState } from 'react';
import { useCreateTrophy, useUpdateTrophy } from '../../hooks/use-content-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { Trophy } from '../../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: Trophy | null;
}

export function TrophiesAdminFormSheet({ open, onOpenChange, edit }: Props) {
  const create = useCreateTrophy();
  const update = useUpdateTrophy();
  const [name, setName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [competition, setCompetition] = useState('');
  const [imagePath, setImagePath] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(edit?.name ?? '');
    setYear(edit?.year ?? new Date().getFullYear());
    setCompetition(edit?.competition ?? '');
    setImagePath(edit?.imagePath ?? '');
  }, [open, edit]);

  const save = async () => {
    const body = { name, year, competition: competition || undefined, imagePath: imagePath || undefined };
    if (edit) await update.mutateAsync({ id: edit.id, ...body });
    else await create.mutateAsync(body);
    onOpenChange(false);
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={edit ? 'Uredi trofej' : 'Novi trofej'}>
      <div className="space-y-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naziv *" />
        <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} placeholder="Godina" />
        <Input value={competition} onChange={(e) => setCompetition(e.target.value)} placeholder="Takmičenje" />
        <MediaPicker value={imagePath} onChange={setImagePath} label="Slika trofeja" />
        <Button onClick={() => void save()} disabled={!name || create.isPending || update.isPending}>
          {edit ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
