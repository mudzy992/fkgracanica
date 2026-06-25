import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMatches, useSeasons } from '../../hooks';
import { useApproveMatchReport, useDeleteMatch } from '../../hooks/use-competition-admin';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { useConfirm } from '../../hooks/use-confirm';
import { MatchLineupSheet } from './MatchLineupSheet';
import { MatchesAdminFormSheet } from './MatchesAdminFormSheet';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { formatDateTime } from '../../lib/utils';
import type { Match } from '../../types';

export function MatchesAdminPage() {
  const { user } = useAuth();
  const canApprove = hasPermission(user?.permissions, 'live.approve');
  const { data: seasons } = useSeasons();
  const activeSeasonId = (seasons as { id: string }[] | undefined)?.[0]?.id;
  const { data, isLoading } = useMatches(activeSeasonId);
  const approve = useApproveMatchReport();
  const remove = useDeleteMatch();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Match | null>(null);
  const [lineupMatch, setLineupMatch] = useState<Match | null>(null);

  const onDelete = async (match: Match) => {
    const ok = await confirm({
      title: 'Obrisati utakmicu?',
      description: `${match.homeClub?.name ?? '?'} vs ${match.awayClub?.name ?? '?'}`,
      variant: 'danger',
      confirmLabel: 'Obriši',
    });
    if (ok) void remove.mutateAsync(match.id);
  };

  return (
    <>
      <Seo title="Utakmice" />
      {dialog}
      <AdminPageShell
        title="Utakmice"
        isLoading={isLoading}
        actions={
          <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }} disabled={!activeSeasonId}>
            <Plus className="mr-1 h-4 w-4" />
            Nova
          </Button>
        }
      >
        <AdminDataTable
          rows={data ?? []}
          columns={[
            {
              key: 'match',
              header: 'Utakmica',
              render: (r) => `${r.homeClub?.name ?? '?'} vs ${r.awayClub?.name ?? '?'}`,
            },
            { key: 'status', header: 'Status', render: (r) => r.status },
            { key: 'report', header: 'Izvještaj', render: (r) => r.reportStatus ?? 'DRAFT' },
            { key: 'date', header: 'Datum', render: (r) => formatDateTime(r.scheduledAt) },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) => (
                <div className="flex flex-wrap gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEdit(r); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setLineupMatch(r)}>
                    Postava
                  </Button>
                  {canApprove && r.reportStatus === 'PENDING_APPROVAL' && (
                    <Button size="sm" variant="outline" onClick={() => void approve.mutateAsync(r.id)} disabled={approve.isPending}>
                      Odobri
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => void onDelete(r)}>
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </AdminPageShell>
      <MatchLineupSheet
        matchId={lineupMatch?.id ?? null}
        matchLabel={lineupMatch ? `${lineupMatch.homeClub?.name ?? '?'} vs ${lineupMatch.awayClub?.name ?? '?'}` : ''}
        open={!!lineupMatch}
        onOpenChange={(o) => !o && setLineupMatch(null)}
      />
      <MatchesAdminFormSheet
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}
        edit={edit}
        seasonId={activeSeasonId}
      />
    </>
  );
}
