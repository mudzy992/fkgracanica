import { useEffect, useState } from 'react';
import { useClubs } from '../../../hooks';
import { useCreateMatch, useUpdateMatch } from '../../../hooks/use-competition-admin';
import { AdminFormSheet } from '../../../components/admin/AdminFormSheet';
import { EntitySelect } from '../../../components/admin/EntitySelect';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { Match, MatchStatus } from '../../../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: Match | null;
  seasonId: string;
  roundId: string;
}

const statuses: MatchStatus[] = ['SCHEDULED', 'LIVE', 'HALFTIME', 'FINISHED', 'POSTPONED', 'CANCELLED'];

function toLocalDatetime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MatchFormSheet({ open, onOpenChange, edit, seasonId, roundId }: Props) {
  const { data: clubs } = useClubs();
  const create = useCreateMatch();
  const update = useUpdateMatch();
  const [homeClubId, setHomeClubId] = useState('');
  const [awayClubId, setAwayClubId] = useState('');
  const [venue, setVenue] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [status, setStatus] = useState<MatchStatus>('SCHEDULED');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [error, setError] = useState('');
  const clubOptions = (clubs ?? []).map((c) => ({ id: c.id, label: c.name }));

  useEffect(() => {
    if (!open) return;
    setError('');
    setHomeClubId(edit?.homeClubId ?? edit?.homeClub?.id ?? '');
    setAwayClubId(edit?.awayClubId ?? edit?.awayClub?.id ?? '');
    setVenue(edit?.venue ?? '');
    setScheduledAt(toLocalDatetime(edit?.scheduledAt) || toLocalDatetime(new Date().toISOString()));
    setStatus(edit?.status ?? 'SCHEDULED');
    setHomeScore(edit?.homeScore ?? 0);
    setAwayScore(edit?.awayScore ?? 0);
  }, [open, edit]);

  const save = async () => {
    if (homeClubId === awayClubId) {
      setError('Domaći i gosti moraju biti različiti klubovi.');
      return;
    }
    try {
      setError('');
      const body = { seasonId, homeClubId, awayClubId, venue: venue || null, scheduledAt: new Date(scheduledAt).toISOString(), roundId, status, homeScore, awayScore };
      if (edit) await update.mutateAsync({ id: edit.id, ...body });
      else await create.mutateAsync(body);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Spremanje nije uspjelo.');
    }
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={edit ? 'Uredi utakmicu' : 'Nova utakmica'}>
      <div className="space-y-4">
        <EntitySelect label="Domaći" value={homeClubId} onChange={setHomeClubId} options={clubOptions} />
        <EntitySelect label="Gosti" value={awayClubId} onChange={setAwayClubId} options={clubOptions} />
        <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Stadion" />
        <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        {edit && (
          <>
            <EntitySelect label="Status" value={status} onChange={(v: string) => setStatus(v as MatchStatus)} options={statuses.map((s) => ({ id: s, label: s }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" min={0} value={homeScore} onChange={(e) => setHomeScore(Number(e.target.value))} />
              <Input type="number" min={0} value={awayScore} onChange={(e) => setAwayScore(Number(e.target.value))} />
            </div>
          </>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button onClick={() => void save()} disabled={!homeClubId || !awayClubId || !scheduledAt || create.isPending || update.isPending}>
          {edit ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
