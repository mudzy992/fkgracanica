import { useEffect, useState } from 'react';
import { useCreatePlayer, useUpdatePlayer } from '../../hooks/use-competition-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { Player } from '../../types';

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: Player | null;
}

export function PlayersAdminFormSheet({ open, onOpenChange, edit }: Props) {
  const create = useCreatePlayer();
  const update = useUpdatePlayer();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('MID');
  const [number, setNumber] = useState('');
  const [photoPath, setPhotoPath] = useState('');

  useEffect(() => {
    if (!open) return;
    setFirstName(edit?.firstName ?? '');
    setLastName(edit?.lastName ?? '');
    setPosition(edit?.position ?? 'MID');
    setNumber(edit?.number != null ? String(edit.number) : '');
    setPhotoPath(edit?.photoPath ?? '');
  }, [open, edit]);

  const save = async () => {
    const body = {
      firstName,
      lastName,
      position,
      number: number ? Number(number) : undefined,
      photoPath: photoPath || undefined,
    };
    if (edit) await update.mutateAsync({ id: edit.id, ...body });
    else await create.mutateAsync(body);
    onOpenChange(false);
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={edit ? 'Uredi igrača' : 'Novi igrač'}>
      <div className="space-y-4">
        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ime *" />
        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Prezime *" />
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {POSITIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <Input type="number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Broj dresa" />
        <MediaPicker value={photoPath} onChange={setPhotoPath} label="Fotografija" />
        <Button onClick={() => void save()} disabled={!firstName || !lastName || create.isPending || update.isPending}>
          {edit ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
