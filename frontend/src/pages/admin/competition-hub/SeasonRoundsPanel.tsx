import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useDeleteRound, useRounds } from '../../../hooks/use-rounds';
import { useConfirm } from '../../../hooks/use-confirm';
import { roundLabel } from '../../../lib/round-utils';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';
import type { CompetitionRound } from '../../../types';
import { RoundFormSheet } from './RoundFormSheet';

interface Props {
  seasonId: string;
  selectedRoundId: string | null;
  onSelectRound: (id: string) => void;
  canManage: boolean;
}

export function SeasonRoundsPanel({ seasonId, selectedRoundId, onSelectRound, canManage }: Props) {
  const { data: rounds, isLoading } = useRounds(seasonId);
  const remove = useDeleteRound();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<CompetitionRound | null>(null);

  const onDelete = async (round: CompetitionRound, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await confirm({ title: 'Obrisati kolo?', description: roundLabel(round), variant: 'danger', confirmLabel: 'Obriši' });
    if (ok) void remove.mutateAsync({ id: round.id, seasonId });
  };

  return (
    <>
      {dialog}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold">Kola</h3>
        {canManage && (
          <Button size="sm" variant="outline" onClick={() => { setEdit(null); setOpen(true); }}>
            <Plus className="mr-1 h-4 w-4" />
            Kolo
          </Button>
        )}
      </div>
      <div className="divide-y divide-slate-100">
        {isLoading && <p className="p-4 text-sm text-text-muted">Učitavanje...</p>}
        {!isLoading && !(rounds ?? []).length && <p className="p-4 text-sm text-text-muted">Dodajte prvo kolo.</p>}
        {(rounds ?? []).map((round) => (
          <button
            key={round.id}
            type="button"
            onClick={() => onSelectRound(round.id)}
            className={cn('flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-surface', selectedRoundId === round.id && 'bg-primary/5')}
          >
            <span className="font-medium">{roundLabel(round)}</span>
            <span className="text-text-muted">{round._count?.matches ?? 0} utakm.</span>
            {canManage && (
              <span className="flex gap-1" onClick={(e) => e.stopPropagation()} role="presentation">
                <Button variant="ghost" size="icon" onClick={() => { setEdit(round); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" onClick={(e) => void onDelete(round, e)}><Trash2 className="h-3.5 w-3.5 text-danger" /></Button>
              </span>
            )}
          </button>
        ))}
      </div>
      <RoundFormSheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }} edit={edit} seasonId={seasonId} />
    </>
  );
}
