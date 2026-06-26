import { useEffect, useState } from 'react';
import { useCreateRound, useUpdateRound } from '../../../hooks/use-rounds';
import { AdminFormSheet } from '../../../components/admin/AdminFormSheet';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { CompetitionRound } from '../../../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: CompetitionRound | null;
  seasonId: string;
}

function toLocalDate(iso?: string | null) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function RoundFormSheet({ open, onOpenChange, edit, seasonId }: Props) {
  const create = useCreateRound();
  const update = useUpdateRound();
  const [number, setNumber] = useState(1);
  const [name, setName] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setNumber(edit?.number ?? 1);
    setName(edit?.name ?? '');
    setStartsAt(toLocalDate(edit?.startsAt));
    setEndsAt(toLocalDate(edit?.endsAt));
  }, [open, edit]);

  const save = async () => {
    try {
      setError('');
      const body = {
        seasonId,
        number,
        name: name.trim() || undefined,
        startsAt: startsAt || undefined,
        endsAt: endsAt || undefined,
      };
      if (edit) await update.mutateAsync({ id: edit.id, ...body });
      else await create.mutateAsync(body);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Spremanje nije uspjelo.');
    }
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={edit ? 'Uredi kolo' : 'Novo kolo'}>
      <div className="space-y-4">
        <Input type="number" min={1} value={number} onChange={(e) => setNumber(Number(e.target.value))} placeholder="Broj kola *" />
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naziv (opcionalno)" />
        <Input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        <Input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button onClick={() => void save()} disabled={!number || create.isPending || update.isPending}>
          {edit ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
