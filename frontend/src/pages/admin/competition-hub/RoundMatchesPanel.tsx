import { buttonVariants } from "../../../components/ui/button-variants";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileText, Pencil, Plus, Radio, Trash2 } from 'lucide-react';
import { useMatches } from '../../../hooks';
import { useDeleteMatch } from '../../../hooks/use-competition-admin';
import { useConfirm } from '../../../hooks/use-confirm';
import { useAuth } from '../../../lib/auth';
import { canEditReport } from '../../../lib/match-report';
import { isRetrospectiveMatch } from '../../../lib/match-retrospective';
import { hasPermission } from '../../../lib/permissions';
import { matchStatusLabel } from '../../../lib/match-status-label';
import { cn, formatDateTime } from '../../../lib/utils';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { AdminDataTable } from '../../../components/admin/AdminPageShell';
import type { Match } from '../../../types';
import { MatchFormSheet } from './MatchFormSheet';
import { MatchLineupSheet } from './MatchLineupSheet';
import { isScheduledMatch, useRoundMatchesSorted } from './round-matches-utils';
import { runAction } from '../../../lib/action-errors';

interface Props {
  seasonId: string;
  roundId: string;
  canManage: boolean;
}

export function RoundMatchesPanel({ seasonId, roundId, canManage }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = useMatches(seasonId, roundId);
  const rows = useRoundMatchesSorted(data);
  const { user } = useAuth();
  const canLive = hasPermission(user?.permissions, 'live.manage');
  const remove = useDeleteMatch();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Match | null>(null);
  const [lineupId, setLineupId] = useState<string | null>(null);

  const onDelete = async (match: Match) => {
    const ok = await confirm({
      title: 'Obrisati utakmicu?',
      description: `${match.homeClub?.name} vs ${match.awayClub?.name}`,
      variant: 'danger',
      confirmLabel: 'Obriši',
    });
    if (ok) void runAction(remove.mutateAsync(match.id));
  };

  return (
    <>
      {dialog}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <h3 className="text-sm font-semibold">{t('admin.roundMatches.title')}</h3>
        {canManage && (
          <Button
            size="sm"
            onClick={() => {
              setEdit(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Utakmica
          </Button>
        )}
      </div>
      <AdminDataTable
        rows={rows}
        rowClassName={(r) =>
          isScheduledMatch(r) ? 'border-l-4 border-l-primary bg-primary/[0.04]' : undefined
        }
        empty={isLoading ? 'Učitavanje...' : 'Nema utakmica u ovom kolu.'}
        columns={[
          {
            key: 'match',
            header: 'Utakmica',
            render: (r) => (
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  {r.homeClub?.name} {r.homeScore}:{r.awayScore} {r.awayClub?.name}
                </span>
                {isScheduledMatch(r) && (
                  <Badge variant="default" className="text-[10px]">
                    Zakazano
                  </Badge>
                )}
                {isRetrospectiveMatch(r) && (
                  <Badge variant="muted" className="text-[10px]">
                    Retro
                  </Badge>
                )}
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (r) => (
              <Badge variant={r.status === 'SCHEDULED' ? 'default' : 'muted'}>
                {matchStatusLabel(r.status)}
              </Badge>
            ),
          },
          { key: 'date', header: 'Datum', render: (r) => formatDateTime(r.scheduledAt) },
          ...(canManage || canLive
            ? [
                {
                  key: 'actions',
                  header: 'Akcije',
                  render: (r: Match) => {
                    const finished = r.status === 'FINISHED';
                    const retro = isRetrospectiveMatch(r);
                    const reportEditable = canEditReport(r);
                    return (
                      <div className="flex flex-wrap gap-1">
                        {canLive && !finished && (
                          <Link to={`/admin/live/${r.id}`} className={cn(buttonVariants({variant: "outline", size: "sm"}))}><Radio className="mr-1 h-3 w-3" />
                              Live</Link>
                        )}
                        {canLive && reportEditable && (
                          <Link to={`/admin/matches/${r.id}/report`} className={cn(buttonVariants({variant: "outline", size: "sm"}))}><FileText className="mr-1 h-3 w-3" />
                              Izvještaj</Link>
                        )}
                        {canManage && (!finished || retro) && (
                          <>
                            {!finished && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEdit(r);
                                  setOpen(true);
                                }}
                                aria-label={t('actions.edit')}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => setLineupId(r.id)}>
                              Postava
                            </Button>
                            {!finished && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => void onDelete(r)}
                                aria-label={t('actions.delete')}
                              >
                                <Trash2 className="h-4 w-4 text-danger" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  },
                },
              ]
            : []),
        ]}
      />
      <MatchFormSheet
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEdit(null);
        }}
        edit={edit}
        seasonId={seasonId}
        roundId={roundId}
      />
      <MatchLineupSheet
        matchId={lineupId}
        open={!!lineupId}
        onOpenChange={(o) => !o && setLineupId(null)}
      />
    </>
  );
}
