import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  useAssignClubSquad,
  useClubSquad,
  useUpdateClubFormation,
} from '../../../../hooks/use-club-hub';
import { usePlayers } from '../../../../hooks';
import { buildSwapAssignments, parseDndId, resolveDragAssignments, squadSlotDndId } from '../../../../lib/formation-dnd';
import type { ClubSquadSlot } from '../../../../types/club-hub';
import { Skeleton } from '../../../../components/ui/skeleton';
import { ResponsiveFormationEditablePitch } from '../../../../components/admin/formation/FormationEditablePitch';
import { FormationInputs } from '../../../../components/admin/formation/FormationInputs';
import { FormationPlayerPool } from '../../../../components/admin/formation/FormationPlayerPool';
import { FormationSlotPanel } from '../../../../components/admin/formation/FormationSlotPanel';
import { BenchDropRow } from '../../../../components/admin/formation/BenchDropRow';

export function ClubFormationTab({ clubId }: { clubId: string }) {
  const { data, isLoading } = useClubSquad(clubId);
  const { data: players } = usePlayers({ clubId, activeOnly: false });
  const updateFormation = useUpdateClubFormation(clubId);
  const assign = useAssignClubSquad(clubId);
  const [def, setDef] = useState('4');
  const [mid, setMid] = useState('3');
  const [fwd, setFwd] = useState('3');
  const [activeSlot, setActiveSlot] = useState<ClubSquadSlot | null>(null);
  const [dragLabel, setDragLabel] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    if (!data) return;
    setDef(String(data.formation.def));
    setMid(String(data.formation.mid));
    setFwd(String(data.formation.fwd));
  }, [data]);

  const bench = useMemo(() => data?.slots.filter((s) => s.isBench) ?? [], [data]);
  const usedIds = useMemo(
    () => new Set(data?.slots.map((s) => s.playerId).filter(Boolean) as string[]),
    [data],
  );
  const poolPlayers = useMemo(
    () => (players ?? []).filter((p) => !usedIds.has(p.id)),
    [players, usedIds],
  );

  if (isLoading || !data) return <Skeleton className="h-96" />;

  const applyFormation = async () => {
    await updateFormation.mutateAsync({ def: Number(def), mid: Number(mid), fwd: Number(fwd) });
    setActiveSlot(null);
  };

  const runAssign = async (assignments: Parameters<typeof assign.mutateAsync>[0]) => {
    await assign.mutateAsync(assignments);
    setActiveSlot(null);
  };

  const assignPlayer = (playerId: string) => {
    if (!activeSlot) return;
    void runAssign(buildSwapAssignments(data.slots, activeSlot, playerId));
  };

  const removePlayer = () => {
    if (!activeSlot) return;
    void runAssign([{ slotIndex: activeSlot.slotIndex, isBench: activeSlot.isBench, playerId: null }]);
  };

  const onDragStart = (event: DragStartEvent) => {
    const parsed = parseDndId(String(event.active.id));
    if (parsed?.kind === 'player') {
      const p = players?.find((x) => x.id === parsed.playerId);
      setDragLabel(p ? `${p.firstName} ${p.lastName}` : '');
    } else if (parsed?.kind === 'slot') {
      const slot = data.slots.find((s) => squadSlotDndId(s) === String(event.active.id));
      setDragLabel(slot?.player ? `${slot.player.firstName} ${slot.player.lastName}` : '');
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setDragLabel('');
    const { active, over } = event;
    if (!over) return;
    const assignments = resolveDragAssignments(data.slots, String(active.id), String(over.id));
    if (assignments) void runAssign(assignments);
  };

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <FormationInputs
            def={def}
            mid={mid}
            fwd={fwd}
            onDef={setDef}
            onMid={setMid}
            onFwd={setFwd}
            onApply={() => void applyFormation()}
            applying={updateFormation.isPending}
          />
          <ResponsiveFormationEditablePitch
            slots={data.slots}
            activeSlot={activeSlot}
            onSlotClick={setActiveSlot}
            pending={assign.isPending}
          />
        </div>
        <div className="space-y-4">
          {activeSlot ? (
            <FormationSlotPanel
              slot={activeSlot}
              players={players ?? []}
              onPick={assignPlayer}
              onRemove={removePlayer}
              onClose={() => setActiveSlot(null)}
            />
          ) : (
            <p className="text-sm text-text-muted">Odaberite poziciju na terenu ili klupi.</p>
          )}
          <FormationPlayerPool players={poolPlayers} />
          <div>
            <h3 className="mb-2 font-semibold">Klupa</h3>
            <div className="space-y-2">
              {bench.map((slot) => (
                <BenchDropRow
                  key={slot.id}
                  slot={slot}
                  active={activeSlot?.id === slot.id}
                  onSelect={() => setActiveSlot(slot)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <DragOverlay>{dragLabel ? <span className="rounded bg-primary px-2 py-1 text-xs text-white">{dragLabel}</span> : null}</DragOverlay>
    </DndContext>
  );
}
