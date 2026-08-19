import type { Match } from '../../../types';
import { isPenaltiesPhase } from '../../../lib/match-live-phase';
import { CommentatorPenaltiesBoard } from './CommentatorPenaltiesBoard';
import { CommentatorClockBar } from './CommentatorClockBar';
import { CommentatorTeamColumn } from './CommentatorTeamBoard';
import { CommentatorCommentPanel } from './CommentatorCommentPanel';
import { CommentatorEventLog } from './CommentatorEventLog';

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
      <CommentatorEventLog match={match} />
    </div>
  );
}
