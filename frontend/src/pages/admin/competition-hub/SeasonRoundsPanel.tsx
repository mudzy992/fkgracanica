import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { useDeleteRound, useRounds, type RoundDeleteImpact } from '../../../hooks/use-rounds';
import { useConfirm } from '../../../hooks/use-confirm';
import { roundLabel } from '../../../lib/round-utils';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';
import type { CompetitionRound } from '../../../types';
import { RoundFormSheet } from './RoundFormSheet';
import { RoundCascadeDeleteDialog } from './RoundCascadeDeleteDialog';

interface Props {
  seasonId: string;
  selectedRoundId: string | null;
  onSelectRound: (id: string) => void;
  canManage: boolean;
}

export function SeasonRoundsPanel({ seasonId, selectedRoundId, onSelectRound, canManage }: Props) {
  const { t } = useTranslation();
  const { data: rounds, isLoading } = useRounds(seasonId);
  const remove = useDeleteRound();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<CompetitionRound | null>(null);
  const [cascadeRound, setCascadeRound] = useState<CompetitionRound | null>(null);
  const [cascadeImpact, setCascadeImpact] = useState<RoundDeleteImpact | null>(null);

  const onDelete = async (round: CompetitionRound, e: React.MouseEvent) => {
    e.stopPropagation();
    const count = round._count?.matches ?? 0;
    if (count === 0) {
      const ok = await confirm({
        title: 'Obrisati kolo?',
        description: roundLabel(round),
        variant: 'danger',
        confirmLabel: 'Obriši',
      });
      if (ok) void remove.mutateAsync({ id: round.id, seasonId });
      return;
    }
    try {
      const impact = (await api.get<RoundDeleteImpact>(`/rounds/${round.id}/delete-impact`)).data;
      setCascadeImpact(impact);
      setCascadeRound(round);
    } catch {
      await confirm({
        title: 'Brisanje nije moguće',
        description: 'Nije moguće učitati podatke o kolu.',
        confirmLabel: 'U redu',
      });
    }
  };

  const onCascadeConfirm = async () => {
    if (!cascadeRound) return;
    await remove.mutateAsync({ id: cascadeRound.id, seasonId, cascade: true });
    if (selectedRoundId === cascadeRound.id) onSelectRound('');
    setCascadeRound(null);
    setCascadeImpact(null);
  };

  return (
    <>
      {dialog}
      <RoundCascadeDeleteDialog
        open={!!cascadeRound && !!cascadeImpact}
        roundLabel={cascadeRound ? roundLabel(cascadeRound) : ''}
        impact={
          cascadeImpact ?? {
            matchCount: 0,
            approvedReportCount: 0,
            ticketCount: 0,
            eventCount: 0,
            lineupCount: 0,
            commentCount: 0,
          }
        }
        isPending={remove.isPending}
        onOpenChange={(o) => {
          if (!o) {
            setCascadeRound(null);
            setCascadeImpact(null);
          }
        }}
        onConfirm={() => void onCascadeConfirm()}
      />
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold">{t('admin.roundsPanel.rounds')}</h3>
        {canManage && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEdit(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            {t('admin.roundsPanel.round')}
          </Button>
        )}
      </div>
      <div className="divide-y divide-slate-100">
        {isLoading && <p className="p-4 text-sm text-text-muted">{t('admin.common.loading')}</p>}
        {!isLoading && !(rounds ?? []).length && (
          <p className="p-4 text-sm text-text-muted">{t('admin.roundsPanel.empty')}</p>
        )}
        {(rounds ?? []).map((round) => (
          <button
            key={round.id}
            type="button"
            onClick={() => onSelectRound(round.id)}
            className={cn(
              'flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-surface',
              selectedRoundId === round.id && 'bg-primary/5',
            )}
          >
            <span className="font-medium">{roundLabel(round)}</span>
            <span className="text-text-muted">
              {t('admin.roundsPanel.matches', { count: round._count?.matches ?? 0 })}
            </span>
            {canManage && (
              <span className="flex gap-1" onClick={(e) => e.stopPropagation()} role="presentation">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEdit(round);
                    setOpen(true);
                  }}
                  aria-label={t('actions.edit')}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => void onDelete(round, e)}
                  aria-label={t('actions.delete')}
                >
                  <Trash2 className="h-3.5 w-3.5 text-danger" />
                </Button>
              </span>
            )}
          </button>
        ))}
      </div>
      <RoundFormSheet
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEdit(null);
        }}
        edit={edit}
        seasonId={seasonId}
      />
    </>
  );
}
