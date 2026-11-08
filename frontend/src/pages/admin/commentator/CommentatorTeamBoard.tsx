import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddMatchEvent } from '../../../hooks/use-live-admin';
import { useAddReportEvent } from '../../../hooks/use-live-report';
import { EntitySelect } from '../../../components/admin/EntitySelect';
import type { Match, MatchLineup } from '../../../types';
import { Button } from '../../../components/ui/button';
import { MORE_EVENTS, QUICK_EVENTS, eventLabel } from './commentator-events';
import { runAction } from '../../../lib/action-errors';

interface Props {
  match: Match;
  side: 'home' | 'away';
  clubName: string;
  clubId: string;
  disabled: boolean;
  reportMode?: boolean;
  eventMinute?: number;
}

function players(lineup: MatchLineup[] | undefined, clubId: string) {
  return (lineup ?? []).filter((l) => l.clubId === clubId && l.player);
}

export function CommentatorTeamColumn({
  match,
  side,
  clubName,
  clubId,
  disabled,
  reportMode,
  eventMinute = 0,
}: Props) {
  const { t } = useTranslation();
  const addLive = useAddMatchEvent();
  const addReport = useAddReportEvent();
  const [playerId, setPlayerId] = useState('');
  const [assistId, setAssistId] = useState('');
  const [subOut, setSubOut] = useState('');
  const [subIn, setSubIn] = useState('');
  const roster = players(match.lineup ?? match.lineups, clubId);
  const opts = roster.map((l) => ({
    id: l.playerId,
    label: `${l.player!.firstName} ${l.player!.lastName}${l.isStarter ? '' : ' (rez)'}`,
  }));
  const busy = addLive.isPending || addReport.isPending;

  const fire = (type: string, extra?: { playerId?: string; relatedPlayerId?: string }) => {
    if (reportMode) {
      void runAction(addReport.mutateAsync({
        matchId: match.id,
        type,
        minute: eventMinute,
        teamSide: side,
        ...extra,
      }));
    } else {
      void runAction(addLive.mutateAsync({ matchId: match.id, type, teamSide: side, ...extra }));
    }
  };

  const fireWithPlayer = (type: string, withAssist = false) => {
    if (!playerId) return;
    const extra: { playerId: string; relatedPlayerId?: string } = { playerId };
    if (withAssist && assistId && assistId !== playerId) extra.relatedPlayerId = assistId;
    fire(type, extra);
    setPlayerId('');
    setAssistId('');
  };

  const doSub = () => {
    if (!subOut || !subIn) return;
    fire('SUBSTITUTION', { playerId: subOut, relatedPlayerId: subIn });
    setSubOut('');
    setSubIn('');
  };

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-surface/50 p-3">
      <h3 className="mb-2 text-center text-sm font-semibold">{clubName}</h3>
      <EntitySelect
        label={t('admin.commentatorBoard.player')}
        value={playerId}
        onChange={setPlayerId}
        options={opts}
      />
      <EntitySelect
        label={t('admin.commentatorBoard.assist')}
        value={assistId}
        onChange={setAssistId}
        options={opts.filter((o) => o.id !== playerId)}
      />
      <div className="mt-2 grid grid-cols-3 gap-1">
        {QUICK_EVENTS.map((type) => (
          <Button
            key={type}
            size="sm"
            variant={type === 'GOAL' ? 'default' : 'outline'}
            className="h-8 px-1 text-[11px]"
            disabled={disabled || busy || !playerId}
            onClick={() => fireWithPlayer(type, type === 'GOAL')}
          >
            {eventLabel(type)}
          </Button>
        ))}
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-[11px] font-medium text-text-muted">
          {t('admin.commentatorBoard.moreEvents')}
        </summary>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {MORE_EVENTS.map((type) => (
            <Button
              key={type}
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[10px]"
              disabled={disabled || busy || (type === 'OWN_GOAL' && !playerId)}
              onClick={() =>
                type === 'OWN_GOAL'
                  ? fireWithPlayer(type)
                  : fire(type, playerId ? { playerId } : undefined)
              }
            >
              {eventLabel(type)}
            </Button>
          ))}
        </div>
      </details>
      <details className="mt-2 border-t border-[var(--border-subtle)] pt-2">
        <summary className="cursor-pointer text-[11px] font-medium text-text-muted">
          {t('admin.commentatorBoard.substitution')}
        </summary>
        <div className="mt-2 space-y-2">
          <EntitySelect
            label={t('admin.commentatorBoard.out')}
            value={subOut}
            onChange={setSubOut}
            options={opts}
          />
          <EntitySelect
            label={t('admin.commentatorBoard.in')}
            value={subIn}
            onChange={setSubIn}
            options={opts}
          />
          <Button
            className="h-8 w-full text-xs"
            size="sm"
            variant="outline"
            disabled={disabled || busy || !subOut || !subIn}
            onClick={doSub}
          >
            Potvrdi
          </Button>
        </div>
      </details>
    </div>
  );
}
