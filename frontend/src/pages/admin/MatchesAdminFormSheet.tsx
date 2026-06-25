import { useEffect, useState } from 'react';
import { useClubs } from '../../hooks';
import {
  useCreateMatch,
  useUpdateMatch,
} from '../../hooks/use-competition-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { EntitySelect } from '../../components/admin/EntitySelect';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { Match } from '../../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: Match | null;
  seasonId?: string;
}

function toLocalDatetime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MatchesAdminFormSheet({ open, onOpenChange, edit, seasonId }: Props) {
  const { data: clubs } = useClubs();
  const create = useCreateMatch();
  const update = useUpdateMatch();
  const [homeClubId, setHomeClubId] = useState('');
  const [awayClubId, setAwayClubId] = useState('');
  const [venue, setVenue] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const clubOptions = (clubs ?? []).map((c) => ({ id: c.id, label: c.name }));

  useEffect(() => {
    if (!open) return;
    setHomeClubId(edit?.homeClubId ?? edit?.homeClub?.id ?? '');
    setAwayClubId(edit?.awayClubId ?? edit?.awayClub?.id ?? '');
    setVenue(edit?.venue ?? '');
    setScheduledAt(toLocalDatetime(edit?.scheduledAt) || toLocalDatetime(new Date().toISOString()));
  }, [open, edit]);

  const save = async () => {
    const body = {
      seasonId: edit?.seasonId ?? seasonId,
      homeClubId,
      awayClubId,
      venue: venue || undefined,
      scheduledAt: new Date(scheduledAt).toISOString(),
    };
    if (edit) await update.mutateAsync({ id: edit.id, ...body });
    else await create.mutateAsync(body);
    onOpenChange(false);
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={edit ? 'Uredi utakmicu' : 'Nova utakmica'}>
      <div className="space-y-4">
        <EntitySelect label="Domaći" value={homeClubId} onChange={setHomeClubId} options={clubOptions} />
        <EntitySelect label="Gosti" value={awayClubId} onChange={setAwayClubId} options={clubOptions} />
        <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Stadion" />
        <div>
          <label className="mb-1 block text-sm font-medium">Datum i vrijeme</label>
          <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        </div>
        <Button
          onClick={() => void save()}
          disabled={!homeClubId || !awayClubId || !scheduledAt || create.isPending || update.isPending}
        >
          {edit ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
