import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClubs } from '../../../hooks';
import { useCreateMatch, useUpdateMatch } from '../../../hooks/use-competition-admin';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { AdminFormSheet } from '../../../components/admin/AdminFormSheet';
import { EntitySelect } from '../../../components/admin/EntitySelect';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import type { Match, MatchStatus } from '../../../types';
import { isPastDatetime } from '../../../lib/match-retrospective';
import { resolveClubVenue } from '../../../lib/club-venue';
import { getApiErrorMessage } from '../../../lib/api-error';
import { parseScheduledAt, toLocalDatetime } from './match-form-datetime';
import { canSendManualStatus, clampScore, editableStatuses, matchStatusOptions } from './match-form-status';
import { MatchFinishedReadOnly } from './MatchFinishedReadOnly';
import { MatchScoreInputs } from './MatchScoreInputs';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: Match | null;
  seasonId: string;
  roundId: string;
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
    if (edit?.status && editableStatuses.includes(edit.status)) setStatus(edit.status);
    else if (isLiveLocked) setStatus(edit!.status);
    else setStatus('SCHEDULED');
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
    const finishing = Boolean(edit) ? status === 'FINISHED' : isPastMatch;
    if (finishing && !isPastDatetime(scheduledIso)) {
      setError('Završena utakmica mora imati datum u prošlosti.');
      return;
    }
    try {
      setError('');
      const scores = { homeScore: clampScore(homeScore), awayScore: clampScore(awayScore) };
      if (edit) {
        const body: Record<string, unknown> = {
          homeClubId,
          awayClubId,
          venue: venue || null,
          scheduledAt: scheduledIso,
          roundId: edit.roundId ?? roundId,
        };
        if (canSendManualStatus(status, isLiveLocked)) {
          body.status = status;
          Object.assign(body, scores);
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
          ...(isPastMatch ? { status: 'FINISHED' as const, ...scores } : { status: 'SCHEDULED' }),
        });
      }
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Spremanje nije uspjelo.'));
    }
  };

  if (isFinished && edit) {
    return (
      <MatchFinishedReadOnly
        open={open}
        onOpenChange={onOpenChange}
        match={edit}
        canLive={canLive}
      />
    );
  }

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={edit ? 'Uredi utakmicu' : 'Nova utakmica'}>
      <div className="space-y-4">
        {isLiveLocked && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <Badge variant="danger">{edit?.status}</Badge>
            <span>Status i rezultat se mijenjaju u komentator panelu.</span>
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
              <MatchScoreInputs
                labeled
                homeScore={homeScore}
                awayScore={awayScore}
                onHome={setHomeScore}
                onAway={setAwayScore}
              />
            )}
          </>
        )}
        {edit && !isLiveLocked && (
          <>
            <EntitySelect
              label="Status"
              value={status}
              onChange={(v: string) => setStatus(v as MatchStatus)}
              options={matchStatusOptions()}
            />
            <p className="text-xs text-text-muted">
              Završenu utakmicu unesite rezultatom ovdje. LIVE ide preko komentatora.
            </p>
            {canLive && (
              <Link to={`/admin/live/${edit.id}`}>
                <Button type="button" variant="outline" size="sm">Otvori komentator</Button>
              </Link>
            )}
            <MatchScoreInputs homeScore={homeScore} awayScore={awayScore} onHome={setHomeScore} onAway={setAwayScore} />
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
