import { useState } from 'react';
import type { Match } from '../../../types';
import { canEditReport } from '../../../lib/match-report';
import { CommentatorRetrospectiveBar } from './CommentatorRetrospectiveBar';
import { CommentatorTeamColumn } from './CommentatorTeamBoard';
import { CommentatorCommentPanel } from './CommentatorCommentPanel';
import { CommentatorEventLog } from './CommentatorEventLog';
import { useDeleteReportEvent } from '../../../hooks/use-live-report';

interface Props {
  match: Match;
}

export function CommentatorReportControls({ match }: Props) {
  const [minute, setMinute] = useState(0);
  const del = useDeleteReportEvent();
  const editable = canEditReport(match);
  return (
    <div className="space-y-4">
      <CommentatorRetrospectiveBar match={match} minute={minute} onMinuteChange={setMinute} />
      <div className="grid gap-3 lg:grid-cols-2">
        <CommentatorTeamColumn
          match={match}
          side="home"
          clubName={match.homeClub?.name ?? 'Domaći'}
          clubId={match.homeClubId}
          disabled={!editable}
          reportMode
          eventMinute={minute}
        />
        <CommentatorTeamColumn
          match={match}
          side="away"
          clubName={match.awayClub?.name ?? 'Gosti'}
          clubId={match.awayClubId}
          disabled={!editable}
          reportMode
          eventMinute={minute}
        />
      </div>
      <CommentatorCommentPanel match={match} reportMode eventMinute={minute} />
      <CommentatorEventLog
        match={match}
        onDelete={
          editable ? (eventId) => void del.mutateAsync({ matchId: match.id, eventId }) : undefined
        }
        deletePending={del.isPending}
      />
    </div>
  );
}
