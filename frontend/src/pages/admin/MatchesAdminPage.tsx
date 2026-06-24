import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useMatches, useSeasons } from '../../hooks';
import { useCreateMatch } from '../../hooks/use-competition-admin';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { formatDateTime } from '../../lib/utils';

export function MatchesAdminPage() {
  const { data: seasons } = useSeasons();
  const activeSeasonId = (seasons as { id: string }[] | undefined)?.[0]?.id;
  const { data, isLoading } = useMatches(activeSeasonId);
  const create = useCreateMatch();
  const [open, setOpen] = useState(false);
  const [homeClubId, setHomeClubId] = useState('');
  const [awayClubId, setAwayClubId] = useState('');
  const [venue, setVenue] = useState('');

  const onCreate = async () => {
    if (!activeSeasonId) return;
    await create.mutateAsync({
      seasonId: activeSeasonId,
      homeClubId,
      awayClubId,
      venue,
      scheduledAt: new Date().toISOString(),
    });
    setOpen(false);
  };

  return (
    <>
      <Seo title="Utakmice" />
      <AdminPageShell
        title="Utakmice"
        isLoading={isLoading}
        actions={
          <Button size="sm" onClick={() => setOpen(true)} disabled={!activeSeasonId}>
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
            { key: 'date', header: 'Datum', render: (r) => formatDateTime(r.scheduledAt) },
          ]}
        />
      </AdminPageShell>
      <AdminFormSheet open={open} onOpenChange={setOpen} title="Nova utakmica">
        <div className="space-y-4">
          <Input value={homeClubId} onChange={(e) => setHomeClubId(e.target.value)} placeholder="Home club ID" />
          <Input value={awayClubId} onChange={(e) => setAwayClubId(e.target.value)} placeholder="Away club ID" />
          <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Stadion" />
          <Button onClick={() => void onCreate()} disabled={!homeClubId || !awayClubId || create.isPending}>
            Kreiraj
          </Button>
        </div>
      </AdminFormSheet>
    </>
  );
}
