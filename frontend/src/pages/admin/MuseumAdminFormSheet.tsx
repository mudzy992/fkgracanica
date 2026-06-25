import { useEffect, useState } from 'react';
import { useCreateMuseumItem, useUpdateMuseumItem } from '../../hooks/use-heritage-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { MuseumItem } from '../../types';

const CATEGORIES = [
  { value: 'artifact', label: 'Artefakt' },
  { value: 'photo', label: 'Fotografija' },
  { value: 'jersey', label: 'Dres' },
  { value: 'trophy', label: 'Trofej' },
  { value: 'document', label: 'Dokument' },
  { value: 'other', label: 'Ostalo' },
];

type MuseumRow = MuseumItem & { category?: string };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: MuseumRow | null;
}

export function MuseumAdminFormSheet({ open, onOpenChange, edit }: Props) {
  const create = useCreateMuseumItem();
  const update = useUpdateMuseumItem();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('artifact');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [imagePath, setImagePath] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(edit?.title ?? '');
    setCategory(edit?.category ?? 'artifact');
    setYear(edit?.year ? String(edit.year) : '');
    setDescription(edit?.description ?? '');
    setImagePath(edit?.imagePath ?? '');
  }, [open, edit]);

  const save = async () => {
    const body = {
      title,
      category,
      year: year ? Number(year) : undefined,
      description: description || undefined,
      imagePath: imagePath || undefined,
    };
    if (edit) await update.mutateAsync({ id: edit.id, ...body });
    else await create.mutateAsync(body);
    onOpenChange(false);
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={edit ? 'Uredi predmet' : 'Novi predmet'}>
      <div className="space-y-4">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Naslov *" />
        <div>
          <label className="mb-1 block text-sm font-medium">Kategorija</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Godina" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-lg border border-slate-200 p-2 text-sm" placeholder="Opis" />
        <MediaPicker value={imagePath} onChange={setImagePath} />
        <Button onClick={() => void save()} disabled={!title || create.isPending || update.isPending}>
          {edit ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
