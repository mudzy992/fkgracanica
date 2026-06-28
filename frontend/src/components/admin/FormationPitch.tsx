import type { Player } from '../../types';
import { cn } from '../../lib/utils';

export interface PitchSlot {
  positionX: number;
  positionY: number;
  label: string;
  playerId: string;
}

interface FormationPitchProps {
  slots: PitchSlot[];
  players: Player[];
  onSlotChange: (index: number, playerId: string) => void;
}

function playerLabel(p: Player) {
  const num = p.number ? `${p.number} ` : '';
  return `${num}${p.firstName} ${p.lastName}`;
}

export function FormationPitch({ slots, players, onSlotChange }: FormationPitchProps) {
  return (
    <div
      className={cn(
        'relative mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-green-700',
        'aspect-[3/4] max-w-md',
      )}
    >
      <div className="absolute inset-4 rounded-lg border-2 border-white/30" />
      <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30" />
      {slots.map((slot, i) => {
        const player = players.find((p) => p.id === slot.playerId);
        const assignedElsewhere = new Set(
          slots.filter((_, idx) => idx !== i && slots[idx].playerId).map((s) => s.playerId),
        );
        const available = players.filter((p) => !assignedElsewhere.has(p.id) || p.id === slot.playerId);
        return (
          <div
            key={i}
            className="absolute flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${slot.positionX}%`, top: `${slot.positionY}%` }}
          >
            <select
              value={slot.playerId}
              onChange={(e) => onSlotChange(i, e.target.value)}
              className="mb-1 max-w-full rounded bg-white/90 px-1 py-0.5 text-[10px]"
            >
              <option value="">{slot.label}</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {playerLabel(p)}
                </option>
              ))}
            </select>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {player?.number ?? slot.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
