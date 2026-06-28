import { useState } from 'react';
import type { Match } from '../../../types';
import { matchEventLabel } from '../../../lib/match-event-labels';
import { formatEventPlayers } from '../../../lib/live-event-text';
import { canEditReport } from '../../../lib/match-report';
import { CommentatorRetrospectiveBar } from './CommentatorRetrospectiveBar';
import { CommentatorTeamColumn } from './CommentatorTeamBoard';
import { CommentatorCommentPanel } from './CommentatorCommentPanel';
import { useDeleteReportEvent } from '../../../hooks/use-live-report';
import { Button } from '../../../components/ui/button';

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
      <details open>
        <summary className="cursor-pointer text-sm font-semibold">Dnevnik događaja</summary>
        <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2 text-sm">
          {match.events?.map((ev) => (
            <li key={ev.id} className="flex items-start justify-between gap-2">
              <span>
                <span className="font-semibold text-primary">{ev.minute}&apos;</span>{' '}
                {matchEventLabel(ev.type)}
                {formatEventPlayers(ev) && ` — ${formatEventPlayers(ev)}`}
              </span>
              {editable && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 shrink-0 text-xs text-danger"
                  disabled={del.isPending}
                  onClick={() => void del.mutateAsync({ matchId: match.id, eventId: ev.id })}
                >
                  Obriši
                </Button>
              )}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
