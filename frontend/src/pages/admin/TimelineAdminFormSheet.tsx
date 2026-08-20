import { useEffect, useState } from 'react';
import { useCreateTimelineEvent, useUpdateTimelineEvent } from '../../hooks/use-heritage-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { ClubTimelineEvent } from '../../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: ClubTimelineEvent | null;
}

export function TimelineAdminFormSheet({ open, onOpenChange, edit }: Props) {
  const create = useCreateTimelineEvent();
  const update = useUpdateTimelineEvent();
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFeedback(null);
      return;
    }
    setYear(edit ? String(edit.year) : '');
    setTitle(edit?.title ?? '');
    setDescription(edit?.description ?? '');
    setImagePath(edit?.imagePath ?? '');
  }, [open, edit]);

  const save = async () => {
    setFeedback(null);
    try {
      const body = {
        year: Number(year),
        title,
        description: description || undefined,
        imagePath: imagePath || null,
      };
      if (edit) await update.mutateAsync({ id: edit.id, ...body });
      else await create.mutateAsync(body);
      onOpenChange(false);
    } catch {
      setFeedback('Spremanje nije uspjelo. Pokušajte ponovo.');
    }
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={edit ? 'Uredi događaj' : 'Novi događaj'}>
      <div className="space-y-4">
        <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Godina *" />
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Naslov *" />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          placeholder="Opis"
        />
        <MediaPicker value={imagePath} onChange={setImagePath} label="Slika" />
        {feedback && <p className="text-sm text-danger">{feedback}</p>}
        <Button onClick={() => void save()} disabled={!year || !title || create.isPending || update.isPending}>
          {edit ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
