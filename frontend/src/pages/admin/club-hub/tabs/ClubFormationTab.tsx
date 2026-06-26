import { useEffect, useState } from 'react';
import {
  useAssignClubSquad,
  useClubSquad,
  useUpdateClubFormation,
} from '../../../../hooks/use-club-hub';
import { usePlayers } from '../../../../hooks';
import { FormationPitch } from '../../../../components/public/clubs/FormationPitch';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Skeleton } from '../../../../components/ui/skeleton';
import type { ClubSquadSlot } from '../../../../types/club-hub';

export function ClubFormationTab({ clubId }: { clubId: string }) {
  const { data, isLoading } = useClubSquad(clubId);
  const { data: players } = usePlayers({ clubId, activeOnly: false });
  const updateFormation = useUpdateClubFormation(clubId);
  const assign = useAssignClubSquad(clubId);
  const [def, setDef] = useState('4');
  const [mid, setMid] = useState('3');
  const [fwd, setFwd] = useState('3');
  const [activeSlot, setActiveSlot] = useState<ClubSquadSlot | null>(null);

  useEffect(() => {
    if (!data) return;
    setDef(String(data.formation.def));
    setMid(String(data.formation.mid));
    setFwd(String(data.formation.fwd));
  }, [data]);

  if (isLoading || !data) return <Skeleton className="h-96" />;

  const bench = data.slots.filter((s) => s.isBench);
  const usedIds = new Set(data.slots.map((s) => s.playerId).filter(Boolean));

  const applyFormation = async () => {
    await updateFormation.mutateAsync({ def: Number(def), mid: Number(mid), fwd: Number(fwd) });
  };

  const assignPlayer = async (playerId: string) => {
    if (!activeSlot) return;
    await assign.mutateAsync([
      { slotIndex: activeSlot.slotIndex, isBench: activeSlot.isBench, playerId },
    ]);
    setActiveSlot(null);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          <Input type="number" min={1} max={10} value={def} onChange={(e) => setDef(e.target.value)} placeholder="ODB" />
          <Input type="number" min={1} max={10} value={mid} onChange={(e) => setMid(e.target.value)} placeholder="VEZ" />
          <Input type="number" min={1} max={10} value={fwd} onChange={(e) => setFwd(e.target.value)} placeholder="NAP" />
          <Button size="sm" onClick={() => void applyFormation()} disabled={updateFormation.isPending}>
            Primijeni
          </Button>
        </div>
        <FormationPitch
          slots={data.slots}
          horizontal
          editable
          onSlotClick={setActiveSlot}
        />
      </div>
      <div className="space-y-4">
        {activeSlot && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="mb-2 text-sm font-medium">Odaberi igrača za poziciju</p>
            <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
              {(players ?? [])
                .filter((p) => !usedIds.has(p.id) || p.id === activeSlot.playerId)
                .map((p) => (
                  <Button key={p.id} size="sm" variant="outline" onClick={() => void assignPlayer(p.id)}>
                    {p.firstName} {p.lastName}
                  </Button>
                ))}
            </div>
            <Button className="mt-2" variant="ghost" size="sm" onClick={() => setActiveSlot(null)}>Odustani</Button>
          </div>
        )}
        <div>
          <h3 className="mb-2 font-semibold">Klupa</h3>
          <div className="space-y-2">
            {bench.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setActiveSlot(slot)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-surface"
              >
                <span>{slot.player ? `${slot.player.firstName} ${slot.player.lastName}` : 'Prazno mjesto'}</span>
                <span className="text-text-muted">#{slot.benchOrder ?? slot.slotIndex + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
