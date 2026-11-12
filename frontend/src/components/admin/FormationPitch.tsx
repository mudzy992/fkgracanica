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
        'aspect-[3/4] max-w-md',
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_70%)]" aria-hidden />
      <div className="absolute inset-4 rounded-lg border-2 border-white/35" />
      <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/35" />
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
            className="absolute flex w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${slot.positionX}%`, top: `${slot.positionY}%` }}
          >
            <Select
              value={slot.playerId}
              onChange={(e) => onSlotChange(i, e.target.value)}
              aria-label={`Pozicija ${slot.label}`}
              className="mb-1.5 h-7 w-full rounded-md border border-[var(--border-subtle)] bg-white px-2 py-1 text-xs font-medium text-background shadow-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{slot.label}</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {playerLabel(p)}
                </option>
              ))}
            </Select>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-[0_2px_8px_rgba(0,0,0,0.35)] ring-1 ring-white/15">
              {player?.number ?? slot.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
