import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClubs } from '../../../hooks';
import { useCreateMatch, useUpdateMatch } from '../../../hooks/use-competition-admin';
import { useAuth } from '../../../lib/auth';
import { canEditReport } from '../../../lib/match-report';
import { hasPermission } from '../../../lib/permissions';
import { AdminFormSheet } from '../../../components/admin/AdminFormSheet';
import { EntitySelect } from '../../../components/admin/EntitySelect';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import type { Match, MatchStatus } from '../../../types';
import { isPastDatetime, isRetrospectiveMatch } from '../../../lib/match-retrospective';
import { resolveClubVenue } from '../../../lib/club-venue';
import { getApiErrorMessage } from '../../../lib/api-error';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: Match | null;
  seasonId: string;
  roundId: string;
}

const editableStatuses: MatchStatus[] = ['SCHEDULED', 'POSTPONED', 'CANCELLED'];

function toLocalDatetime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseScheduledAt(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function MatchFormSheet({ open, onOpenChange, edit, seasonId, roundId }: Props) {
  const { data: clubs } = useClubs();
  const { user } = useAuth();
  const canLive = hasPermission(user?.permissions, 'live.manage');
  const create = useCreateMatch();
  const update = useUpdateMatch();
  const isFinished = edit?.status === 'FINISHED';
  const isLiveLocked = edit?.status === 'LIVE' || edit?.status === 'HALFTIME';
  const [homeClubId, setHomeClubId] = useState('');
  const [awayClubId, setAwayClubId] = useState('');
  const [venue, setVenue] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [status, setStatus] = useState<MatchStatus>('SCHEDULED');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [isPastMatch, setIsPastMatch] = useState(false);
  const [error, setError] = useState('');
  const clubOptions = (clubs ?? []).map((c) => ({ id: c.id, label: c.name }));

  const onHomeClubChange = (id: string) => {
    setHomeClubId(id);
    const defaultVenue = resolveClubVenue((clubs ?? []).find((c) => c.id === id));
    if (defaultVenue) setVenue(defaultVenue);
  };

  useEffect(() => {
    if (!open) return;
    setError('');
    setHomeClubId(edit?.homeClubId ?? edit?.homeClub?.id ?? '');
    setAwayClubId(edit?.awayClubId ?? edit?.awayClub?.id ?? '');
    setVenue(edit?.venue ?? resolveClubVenue(edit?.homeClub) ?? '');
    setScheduledAt(toLocalDatetime(edit?.scheduledAt) || toLocalDatetime(new Date().toISOString()));
    if (edit?.status && editableStatuses.includes(edit.status)) {
      setStatus(edit.status);
    } else if (isLiveLocked) {
      setStatus(edit!.status);
    } else {
      setStatus('SCHEDULED');
    }
    setHomeScore(edit?.homeScore ?? 0);
    setAwayScore(edit?.awayScore ?? 0);
    setIsPastMatch(false);
  }, [open, edit, isLiveLocked]);

  const save = async () => {
    if (isFinished) return;
    if (homeClubId === awayClubId) {
      setError('Domaći i gosti moraju biti različiti klubovi.');
      return;
    }
    const scheduledIso = parseScheduledAt(scheduledAt);
    if (!scheduledIso) {
      setError('Unesite ispravan datum i vrijeme.');
      return;
    }
    if (!edit && isPastMatch && !isPastDatetime(scheduledIso)) {
      setError('Utakmica u prošlosti mora imati datum prije današnjeg dana.');
      return;
    }
    try {
      setError('');
      if (edit) {
        const body: Record<string, unknown> = {
          homeClubId,
          awayClubId,
          venue: venue || null,
          scheduledAt: scheduledIso,
          roundId: edit.roundId ?? roundId,
        };
        if (!isLiveLocked && editableStatuses.includes(status)) {
          body.status = status;
          body.homeScore = Math.max(0, Math.floor(Number(homeScore)) || 0);
          body.awayScore = Math.max(0, Math.floor(Number(awayScore)) || 0);
        }
        await update.mutateAsync({ id: edit.id, ...body });
      } else {
        await create.mutateAsync({
          seasonId,
          homeClubId,
          awayClubId,
          venue: venue || null,
          scheduledAt: scheduledIso,
          roundId,
          ...(isPastMatch
            ? {
                status: 'FINISHED',
                homeScore: Math.max(0, Math.floor(Number(homeScore)) || 0),
                awayScore: Math.max(0, Math.floor(Number(awayScore)) || 0),
              }
            : { status: 'SCHEDULED' }),
        });
      }
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Spremanje nije uspjelo.'));
    }
  };

  if (isFinished && edit && !isRetrospectiveMatch(edit)) {
    return (
      <AdminFormSheet open={open} onOpenChange={onOpenChange} title="Utakmica (završena)">
        <div className="space-y-3 text-sm">
          <p>
            <strong>{edit.homeClub?.name}</strong> {edit.homeScore}:{edit.awayScore}{' '}
            <strong>{edit.awayClub?.name}</strong>
          </p>
          <p className="text-text-muted">{edit.venue ?? '—'} · {toLocalDatetime(edit.scheduledAt).replace('T', ' ')}</p>
          <p className="text-text-muted">Završena utakmica se ne može uređivati.</p>
          {canLive && canEditReport(edit) && (
            <Link to={`/admin/matches/${edit.id}/report`}>
              <Button type="button" variant="default" size="sm">Uredi izvještaj</Button>
            </Link>
          )}
        </div>
      </AdminFormSheet>
    );
  }

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={edit ? 'Uredi utakmicu' : 'Nova utakmica'}>
      <div className="space-y-4">
        {isLiveLocked && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <Badge variant="danger">{edit?.status}</Badge>
            <span>Status i rezultat se mijenjaju u komentator panelu. Ovdje možete izmijeniti datum, stadion i klubove.</span>
          </div>
        )}
        <EntitySelect label="Domaći" value={homeClubId} onChange={onHomeClubChange} options={clubOptions} />
        <EntitySelect label="Gosti" value={awayClubId} onChange={setAwayClubId} options={clubOptions} />
        <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Stadion" />
        <div>
          <label className="mb-1 block text-sm font-medium">Datum i vrijeme</label>
          <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        </div>
        {!edit && (
          <>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPastMatch}
                onChange={(e) => setIsPastMatch(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Utakmica u prošlosti (već odigrana)
            </label>
            {isPastMatch && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Golovi domaćih</label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={homeScore}
                    onChange={(e) => setHomeScore(Math.max(0, Math.floor(Number(e.target.value)) || 0))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Golovi gostiju</label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={awayScore}
                    onChange={(e) => setAwayScore(Math.max(0, Math.floor(Number(e.target.value)) || 0))}
                  />
                </div>
              </div>
            )}
          </>
        )}
        {edit && !isLiveLocked && (
          <>
            <EntitySelect
              label="Status"
              value={status}
              onChange={(v: string) => setStatus(v as MatchStatus)}
              options={editableStatuses.map((s) => ({ id: s, label: s }))}
            />
            <p className="text-xs text-text-muted">
              Za LIVE koristite dugme Live → „Započni utakmicu” u komentator panelu.
            </p>
            {canLive && (
              <Link to={`/admin/live/${edit.id}`}>
                <Button type="button" variant="outline" size="sm">Otvori komentator</Button>
              </Link>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min={0}
                step={1}
                value={homeScore}
                onChange={(e) => setHomeScore(Math.max(0, Math.floor(Number(e.target.value)) || 0))}
              />
              <Input
                type="number"
                min={0}
                step={1}
                value={awayScore}
                onChange={(e) => setAwayScore(Math.max(0, Math.floor(Number(e.target.value)) || 0))}
              />
            </div>
          </>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
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
