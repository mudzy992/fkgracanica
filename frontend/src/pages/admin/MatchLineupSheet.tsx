import { useEffect, useState } from 'react';
import { useMatch, usePlayers } from '../../hooks';
import { useSetMatchLineup } from '../../hooks/use-competition-admin';
import { buildFormationSlots, type FormationSlot } from '../../lib/formation-slots';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { FormationPitch } from '../../components/admin/FormationPitch';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

interface MatchLineupSheetProps {
  matchId: string | null;
  matchLabel?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MatchLineupSheet({ matchId, matchLabel, open, onOpenChange }: MatchLineupSheetProps) {
  const { data: match, isLoading: ml } = useMatch(matchId ?? '');
  const { data: players = [], isLoading: pl } = usePlayers();
  const save = useSetMatchLineup();
  const [slots, setSlots] = useState<FormationSlot[]>(buildFormationSlots());

  useEffect(() => {
    if (!match) return;
    const lineup = match.lineup ?? match.lineups;
    setSlots(buildFormationSlots(lineup));
  }, [match]);

  const onSave = async () => {
    if (!matchId) return;
    await save.mutateAsync({
      matchId,
      slots: slots
        .filter((s) => s.playerId)
        .map((s) => ({
          playerId: s.playerId,
          positionX: s.positionX,
          positionY: s.positionY,
          isStarter: true,
        })),
    });
    onOpenChange(false);
  };

  const activePlayers = players.filter((p) => p.isActive);

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={`Postava: ${matchLabel ?? ''}`}>
      {ml || pl ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="space-y-4">
          <FormationPitch
            slots={slots}
            players={activePlayers}
            onSlotChange={(index, playerId) =>
              setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, playerId } : s)))
            }
          />
          <Button className="w-full" onClick={() => void onSave()} disabled={save.isPending}>
            Sačuvaj postavu
          </Button>
        </div>
      )}
    </AdminFormSheet>
  );
}
