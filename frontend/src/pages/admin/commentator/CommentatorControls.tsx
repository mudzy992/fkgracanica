import type { Match } from '../../../types';
import { matchEventLabel } from '../../../lib/match-event-labels';
import { formatEventPlayers } from '../../../lib/live-event-text';
import { isPenaltiesPhase } from '../../../lib/match-live-phase';
import { CommentatorPenaltiesBoard } from './CommentatorPenaltiesBoard';
import { CommentatorClockBar } from './CommentatorClockBar';
import { CommentatorTeamColumn } from './CommentatorTeamBoard';
import { CommentatorCommentPanel } from './CommentatorCommentPanel';

interface Props {
  match: Match;
}

export function CommentatorControls({ match }: Props) {
  const penalties = isPenaltiesPhase(match);
  const canAct = match.status === 'LIVE' && !penalties;

  return (
    <div className="space-y-4">
      <CommentatorClockBar match={match} />
      {penalties ? (
        <CommentatorPenaltiesBoard match={match} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <CommentatorTeamColumn
            match={match}
            side="home"
            clubName={match.homeClub?.name ?? 'Domaći'}
            clubId={match.homeClubId}
            disabled={!canAct}
          />
          <CommentatorTeamColumn
            match={match}
            side="away"
            clubName={match.awayClub?.name ?? 'Gosti'}
            clubId={match.awayClubId}
            disabled={!canAct}
          />
        </div>
      )}
      <CommentatorCommentPanel match={match} />
      <details>
        <summary className="cursor-pointer text-sm font-semibold">Dnevnik događaja</summary>
        <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2 text-sm">
          {match.events?.map((ev) => (
            <li key={ev.id}>
              <span className="font-semibold text-primary">{ev.minute}&apos;</span>{' '}
              {matchEventLabel(ev.type)}
              {formatEventPlayers(ev) && ` — ${formatEventPlayers(ev)}`}
              {ev.description ? ` — ${ev.description}` : ''}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
