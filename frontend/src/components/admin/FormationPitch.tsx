import type { Player } from '../../types';
import { cn } from '../../lib/utils';
import { Select } from '../ui/select';

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
        'relative mx-auto overflow-hidden rounded-2xl border border-white/10 bg-green-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.35)]',
        'aspect-[3/4] max-w-sm',
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_70%)]" aria-hidden />
      <div className="absolute inset-3 rounded-lg border-2 border-white/35 lg:inset-4" />
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/35 lg:h-20 lg:w-20" />
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" aria-hidden />
      {slots.map((slot, i) => {
        const player = players.find((p) => p.id === slot.playerId);
        const assignedElsewhere = new Set(
          slots.filter((_, idx) => idx !== i && slots[idx].playerId).map((s) => s.playerId),
        );
        const available = players.filter(
          (p) => !assignedElsewhere.has(p.id) || p.id === slot.playerId,
        );
        return (
          <div
            key={i}
            className="absolute flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center lg:w-32"
            style={{ left: `${slot.positionX}%`, top: `${slot.positionY}%` }}
          >
            <Select
              value={slot.playerId}
              onChange={(e) => onSlotChange(i, e.target.value)}
              aria-label={`Pozicija ${slot.label}`}
              className="mb-1 h-6 w-full rounded-md border border-[var(--border-subtle)] bg-white px-1.5 py-0 text-[11px] font-medium leading-none text-background shadow-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:h-7 md:px-2 md:text-xs"
            >
              <option value="">{slot.label}</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {playerLabel(p)}
                </option>
              ))}
            </Select>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(0,0,0,0.35)] ring-1 ring-white/15 md:h-9 md:w-9 md:text-xs">
              {player?.number ?? slot.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
