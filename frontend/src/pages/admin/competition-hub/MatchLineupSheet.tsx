import { useEffect, useState } from 'react';
import { useMatch, usePlayers } from '../../../hooks';
import { useSetMatchLineup } from '../../../hooks/use-competition-admin';
import type { FormationSlot } from '../../../lib/formation-slots';
import { AdminFormSheet } from '../../../components/admin/AdminFormSheet';
import { FormationPitch } from '../../../components/admin/FormationPitch';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { cn } from '../../../lib/utils';
import { buildClubMatchLineup, slotsToLineupPayload } from './match-lineup-slots';

interface Props {
  matchId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MatchLineupSheet({ matchId, open, onOpenChange }: Props) {
  const { data: match, isLoading: ml } = useMatch(matchId ?? '');
  const save = useSetMatchLineup();
  const [side, setSide] = useState<'home' | 'away'>('home');
  const [homeSlots, setHomeSlots] = useState<FormationSlot[]>([]);
  const [awaySlots, setAwaySlots] = useState<FormationSlot[]>([]);

  const homeClubId = match?.homeClubId ?? match?.homeClub?.id ?? '';
  const awayClubId = match?.awayClubId ?? match?.awayClub?.id ?? '';

  const { data: homePlayers = [], isLoading: hpl } = usePlayers({ clubId: homeClubId, activeOnly: true });
  const { data: awayPlayers = [], isLoading: apl } = usePlayers({ clubId: awayClubId, activeOnly: true });

  useEffect(() => {
    if (!match) return;
    const lineup = match.lineup ?? match.lineups;
    setHomeSlots(buildClubMatchLineup(lineup, homeClubId));
    setAwaySlots(buildClubMatchLineup(lineup, awayClubId));
  }, [match, homeClubId, awayClubId]);

  const onSave = async () => {
    if (!matchId || !homeClubId || !awayClubId) return;
    await save.mutateAsync({
      matchId,
      slots: [
        ...slotsToLineupPayload(homeSlots, homeClubId),
        ...slotsToLineupPayload(awaySlots, awayClubId),
      ],
    });
    onOpenChange(false);
  };

  const slots = side === 'home' ? homeSlots : awaySlots;
  const players = side === 'home' ? homePlayers : awayPlayers;
  const setSlots = side === 'home' ? setHomeSlots : setAwaySlots;
  const loading = ml || hpl || apl;

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={`Postava: ${match?.homeClub?.name ?? '?'} vs ${match?.awayClub?.name ?? '?'}`}
    >
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['home', 'away'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2 text-sm font-medium',
                  side === s ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200',
                )}
              >
                {s === 'home' ? match?.homeClub?.name ?? 'Domaći' : match?.awayClub?.name ?? 'Gosti'}
              </button>
            ))}
          </div>
          <FormationPitch
            slots={slots}
            players={players}
            onSlotChange={(index, playerId) =>
              setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, playerId } : slot)))
            }
          />
          <Button className="w-full" onClick={() => void onSave()} disabled={save.isPending}>
            Sačuvaj obje postave
          </Button>
        </div>
      )}
    </AdminFormSheet>
  );
}
