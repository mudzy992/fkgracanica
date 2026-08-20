import { useEffect, useState } from 'react';
import { useCreateHallOfFame, useUpdateHallOfFame } from '../../hooks/use-heritage-admin';
import { getApiErrorMessage } from '../../lib/api-error';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { HallOfFameEntry } from '../../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: HallOfFameEntry | null;
}

export function HallOfFameAdminFormSheet({ open, onOpenChange, edit }: Props) {
  const create = useCreateHallOfFame();
  const update = useUpdateHallOfFame();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [years, setYears] = useState('');
  const [bio, setBio] = useState('');
  const [imagePath, setImagePath] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(edit?.name ?? '');
    setRole(edit?.role ?? '');
    setYears(edit?.years ?? '');
    setBio(edit?.bio ?? '');
    setImagePath(edit?.imagePath ?? edit?.photoPath ?? '');
  }, [open, edit]);

  const save = async () => {
    const body = {
      name,
      role,
      years: years || undefined,
      bio: bio || undefined,
      imagePath: imagePath || null,
    };
    try {
      if (edit) await update.mutateAsync({ id: edit.id, ...body });
      else await create.mutateAsync(body);
      onOpenChange(false);
    } catch {
      /* error via mutation state */
    }
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={edit ? 'Uredi unos' : 'Novi unos'}>
      <div className="space-y-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ime *" />
        <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Uloga *" />
        <Input value={years} onChange={(e) => setYears(e.target.value)} placeholder="Godine (npr. 1998–2010)" />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full rounded-lg border border-slate-200 p-2 text-sm" placeholder="Biografija" />
        <MediaPicker value={imagePath} onChange={setImagePath} />
        <Button onClick={() => void save()} disabled={!name || !role || create.isPending || update.isPending}>
          {edit ? 'Spremi' : 'Kreiraj'}
        </Button>
        {(create.isError || update.isError) && (
          <p className="text-sm text-danger">
            {getApiErrorMessage(create.error ?? update.error, 'Spremanje nije uspjelo.')}
          </p>
        )}
      </div>
    </AdminFormSheet>
  );
}
