import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Pencil, Plus, Radio, Trash2 } from 'lucide-react';
import { useMatches } from '../../../hooks';
import { useDeleteMatch } from '../../../hooks/use-competition-admin';
import { useConfirm } from '../../../hooks/use-confirm';
import { useAuth } from '../../../lib/auth';
import { canEditReport } from '../../../lib/match-report';
import { hasPermission } from '../../../lib/permissions';
import { formatDateTime } from '../../../lib/utils';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { AdminDataTable } from '../../../components/admin/AdminPageShell';
import type { Match } from '../../../types';
import { MatchFormSheet } from './MatchFormSheet';
import { MatchLineupSheet } from './MatchLineupSheet';
import { isScheduledMatch, useRoundMatchesSorted } from './round-matches-utils';

interface Props {
  seasonId: string;
  roundId: string;
  canManage: boolean;
}

export function RoundMatchesPanel({ seasonId, roundId, canManage }: Props) {
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
    if (ok) void remove.mutateAsync(match.id);
  };

  return (
    <>
      {dialog}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold">Utakmice u kolu</h3>
        {canManage && (
          <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
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
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (r) => (
              <Badge variant={r.status === 'SCHEDULED' ? 'default' : 'muted'}>{r.status}</Badge>
            ),
          },
          { key: 'date', header: 'Datum', render: (r) => formatDateTime(r.scheduledAt) },
          ...(canManage || canLive
            ? [{
                key: 'actions',
                header: 'Akcije',
                render: (r: Match) => {
                  const finished = r.status === 'FINISHED';
                  const reportEditable = canEditReport(r);
                  return (
                    <div className="flex flex-wrap gap-1">
                      {canLive && !finished && (
                        <Link to={`/admin/live/${r.id}`}>
                          <Button size="sm" variant="outline">
                            <Radio className="mr-1 h-3 w-3" />
                            Live
                          </Button>
                        </Link>
                      )}
                      {canLive && reportEditable && (
                        <Link to={`/admin/matches/${r.id}/report`}>
                          <Button size="sm" variant="outline">
                            <FileText className="mr-1 h-3 w-3" />
                            Izvještaj
                          </Button>
                        </Link>
                      )}
                      {canManage && !finished && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => { setEdit(r); setOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setLineupId(r.id)}>
                            Postava
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => void onDelete(r)}>
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </>
                      )}
                    </div>
                  );
                },
              }]
            : []),
        ]}
      />
      <MatchFormSheet
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}
        edit={edit}
        seasonId={seasonId}
        roundId={roundId}
      />
      <MatchLineupSheet matchId={lineupId} open={!!lineupId} onOpenChange={(o) => !o && setLineupId(null)} />
    </>
  );
}
