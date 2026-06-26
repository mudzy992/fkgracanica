import { useEffect, useState } from 'react';
import { useCreateClub, useUpdateClub } from '../../hooks/use-competition-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import type { Club } from '../../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: Club | null;
}

export function ClubsAdminFormSheet({ open, onOpenChange, edit }: Props) {
  const create = useCreateClub();
  const update = useUpdateClub();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [stadium, setStadium] = useState('');
  const [description, setDescription] = useState('');
  const [crestPath, setCrestPath] = useState('');
  const [isOwnClub, setIsOwnClub] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFeedback(null);
      return;
    }
    setName(edit?.name ?? '');
    setCity(edit?.city ?? '');
    setStadium(edit?.stadium ?? '');
    setDescription(edit?.description ?? '');
    setCrestPath(edit?.crestPath ?? edit?.logoPath ?? '');
    setIsOwnClub(edit?.isOwnClub ?? false);
  }, [open, edit]);

  const save = async () => {
    setFeedback(null);
    try {
      const body = {
        name,
        city: city || undefined,
        stadium: stadium || undefined,
        description: description || undefined,
        crestPath: crestPath || undefined,
        isOwnClub,
      };
      if (edit) await update.mutateAsync({ id: edit.id, ...body });
      else await create.mutateAsync(body);
      onOpenChange(false);
    } catch {
      setFeedback('Spremanje nije uspjelo. Pokušajte ponovo.');
    }
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={edit ? 'Uredi klub' : 'Novi klub'}>
      <div className="space-y-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naziv *" />
        <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Grad" />
        <Input value={stadium} onChange={(e) => setStadium(e.target.value)} placeholder="Stadion" />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          placeholder="Opis kluba (javni prikaz)"
        />
        <MediaPicker value={crestPath} onChange={setCrestPath} label="Grb" />
        <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
          <div>
            <span className="text-sm font-medium">Naš klub</span>
            <p className="text-xs text-text-muted">Samo jedan klub može biti označen kao naš.</p>
          </div>
          <Switch checked={isOwnClub} onCheckedChange={setIsOwnClub} />
        </label>
        {feedback && <p className="text-sm text-danger">{feedback}</p>}
        <Button onClick={() => void save()} disabled={!name || create.isPending || update.isPending}>
          {edit ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
