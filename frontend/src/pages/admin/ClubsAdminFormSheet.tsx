import { useEffect, useState } from 'react';
import { useCreateClub, useUpdateClub } from '../../hooks/use-competition-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import type { Club } from '../../types';

type ClubRow = Club & { stadium?: string | null; isOwnClub?: boolean };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: ClubRow | null;
}

export function ClubsAdminFormSheet({ open, onOpenChange, edit }: Props) {
  const create = useCreateClub();
  const update = useUpdateClub();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [stadium, setStadium] = useState('');
  const [crestPath, setCrestPath] = useState('');
  const [isOwnClub, setIsOwnClub] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(edit?.name ?? '');
    setCity(edit?.city ?? '');
    setStadium(edit?.stadium ?? '');
    setCrestPath(edit?.crestPath ?? edit?.logoPath ?? '');
    setIsOwnClub(edit?.isOwnClub ?? false);
  }, [open, edit]);

  const save = async () => {
    const body = {
      name,
      city: city || undefined,
      stadium: stadium || undefined,
      crestPath: crestPath || undefined,
      isOwnClub,
    };
    if (edit) await update.mutateAsync({ id: edit.id, ...body });
    else await create.mutateAsync(body);
    onOpenChange(false);
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={edit ? 'Uredi klub' : 'Novi klub'}>
      <div className="space-y-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naziv *" />
        <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Grad" />
        <Input value={stadium} onChange={(e) => setStadium(e.target.value)} placeholder="Stadion" />
        <MediaPicker value={crestPath} onChange={setCrestPath} label="Grb" />
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Naš klub</span>
          <Switch checked={isOwnClub} onCheckedChange={setIsOwnClub} />
        </label>
        <Button onClick={() => void save()} disabled={!name || create.isPending || update.isPending}>
          {edit ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
