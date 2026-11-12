import type { Player } from '../../../types';
import type { ClubSquadSlot } from '../../../types/club-hub';
import { Button } from '../../ui/button';
import { Card } from "../../ui/card";

interface Props {
  slot: ClubSquadSlot;
  players: Player[];
  onPick: (playerId: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export function FormationSlotPanel({ slot, players, onPick, onRemove, onClose }: Props) {
  const role = slot.isBench ? 'klupu' : 'poziciju';

  return (
    <Card className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">
            {slot.player
              ? `${slot.player.firstName} ${slot.player.lastName}`
              : 'Prazna pozicija'}
          </p>
          <p className="text-xs text-text-muted">Odaberi igrača za {role}</p>
        </div>
        <div className="flex gap-1">
          {slot.playerId && (
            <Button size="sm" variant="outline" className="text-danger" onClick={onRemove}>
              Ukloni
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onClose}>
            Zatvori
          </Button>
        </div>
      </div>
      <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
        {players.map((p) => (
          <Button
            key={p.id}
            size="sm"
            variant={p.id === slot.playerId ? 'default' : 'outline'}
            onClick={() => onPick(p.id)}
          >
            {p.number ? `${p.number} ` : ''}
            {p.firstName} {p.lastName}
          </Button>
        ))}
      </div>
    </Card>
  );
}
