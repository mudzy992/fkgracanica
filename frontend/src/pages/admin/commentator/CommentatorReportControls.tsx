import { useState } from 'react';
import type { Match } from '../../../types';
import { canEditReport } from '../../../lib/match-report';
import { CommentatorRetrospectiveBar } from './CommentatorRetrospectiveBar';
import { CommentatorTeamColumn } from './CommentatorTeamBoard';
import { CommentatorCommentPanel } from './CommentatorCommentPanel';
import { CommentatorEventLog } from './CommentatorEventLog';
import { useDeleteReportEvent } from '../../../hooks/use-live-report';
import { useConfirm } from '../../../hooks/use-confirm';

interface Props {
  match: Match;
}

export function CommentatorReportControls({ match }: Props) {
  const [minute, setMinute] = useState(0);
  const del = useDeleteReportEvent();
  const { confirm, dialog } = useConfirm();
  const editable = canEditReport(match);

  /** FE-04/P-FE04-2: brisanje zapisa iz izvještaja bez potvrde = gubitak podataka. */
  const deleteEvent = async (eventId: string) => {
    const ok = await confirm({
      title: 'Obrisati zapis iz izvještaja?',
      description: 'Zapis se uklanja iz izvještaja utakmice i ne može se vratiti.',
      confirmLabel: 'Obriši',
      variant: 'danger',
    });
    if (ok) await del.mutateAsync({ matchId: match.id, eventId });
  };
  return (
    <div className="space-y-4">
      {dialog}
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
        onDelete={editable ? (eventId) => void deleteEvent(eventId) : undefined}
        deletePending={del.isPending}
      />
    </div>
  );
}
