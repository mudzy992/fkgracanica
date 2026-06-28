import { useState } from 'react';
import { useAddMatchEvent } from '../../../hooks/use-live-admin';
import { EntitySelect } from '../../../components/admin/EntitySelect';
import type { Match, MatchLineup } from '../../../types';
import { Button } from '../../../components/ui/button';

interface Props {
  match: Match;
}

function players(lineup: MatchLineup[] | undefined, clubId: string) {
  return (lineup ?? []).filter((l) => l.clubId === clubId && l.player);
}

function PenaltySide({
  match,
  side,
  clubName,
  clubId,
}: {
  match: Match;
  side: 'home' | 'away';
  clubName: string;
  clubId: string;
}) {
  const addEvent = useAddMatchEvent();
  const [playerId, setPlayerId] = useState('');
  const roster = players(match.lineup ?? match.lineups, clubId);
  const opts = roster.map((l) => ({
    id: l.playerId,
    label: `${l.player!.firstName} ${l.player!.lastName}`,
  }));
  const busy = addEvent.isPending;

  const kick = (type: 'PENALTY_SCORED' | 'PENALTY_MISSED') => {
    if (!playerId) return;
    void addEvent.mutateAsync({ matchId: match.id, type, teamSide: side, playerId });
    setPlayerId('');
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-surface/50 p-4">
      <h3 className="mb-2 text-center font-semibold">{clubName}</h3>
      <EntitySelect label="Igrač" value={playerId} onChange={setPlayerId} options={opts} />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" disabled={busy || !playerId} onClick={() => kick('PENALTY_SCORED')}>
          Gol
        </Button>
        <Button size="sm" variant="outline" disabled={busy || !playerId} onClick={() => kick('PENALTY_MISSED')}>
          Promašaj
        </Button>
      </div>
    </div>
  );
}

export function CommentatorPenaltiesBoard({ match }: Props) {
  const homePen = match.penaltyHomeScore ?? 0;
  const awayPen = match.penaltyAwayScore ?? 0;

  return (
    <div className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Izvođenje penala</p>
        <p className="mt-2 font-display text-3xl font-bold tabular-nums">
          {homePen} : {awayPen}
        </p>
        <p className="mt-1 text-sm text-text-muted">
          Regularni rezultat {match.homeScore}:{match.awayScore}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <PenaltySide match={match} side="home" clubName={match.homeClub?.name ?? 'Domaći'} clubId={match.homeClubId} />
        <PenaltySide match={match} side="away" clubName={match.awayClub?.name ?? 'Gosti'} clubId={match.awayClubId} />
      </div>
    </div>
  );
}
