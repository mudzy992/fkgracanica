import { useTranslation } from 'react-i18next';
import type { Player } from '../../../types';
import type { ClubSquadSlot } from '../../../types/club-hub';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

interface Props {
  slot: ClubSquadSlot;
  players: Player[];
  onPick: (playerId: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export function FormationSlotPanel({ slot, players, onPick, onRemove, onClose }: Props) {
  const { t } = useTranslation();
  const roleText = slot.isBench ? t('admin.formation.pickForBench') : t('admin.formation.pickForPosition');

  return (
    <Card className="rounded-xl border border-primary/30 bg-primary/5 p-3">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-medium md:text-sm">
            {slot.player
              ? `${slot.player.firstName} ${slot.player.lastName}`
              : t('admin.formation.emptyPosition')}
          </p>
          <p className="text-[11px] text-text-muted md:text-xs">{roleText}</p>
        </div>
        <div className="flex gap-1">
          {slot.playerId && (
            <Button size="sm" variant="outline" className="h-7 px-2.5 text-[13px] text-danger md:h-8" onClick={onRemove}>
              {t('admin.formation.remove')}
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[13px] md:h-8" onClick={onClose}>
            {t('admin.formation.close')}
          </Button>
        </div>
      </div>
      <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
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
