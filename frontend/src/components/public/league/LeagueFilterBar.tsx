import { cn } from '../../../lib/utils';
import { seasonLabel, type SeasonOption } from '../../../lib/season-utils';
import { roundLabel } from '../../../lib/round-utils';
import type { CompetitionRound } from '../../../types';
import type { ReactNode } from 'react';

const MANY_ROUNDS = 8;

interface Props {
  seasons: SeasonOption[];
  seasonId?: string;
  onSeasonChange: (id: string) => void;
  rounds: CompetitionRound[];
  upToRound: number | null;
  onRoundChange: (round: number | null) => void;
  className?: string;
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition',
        active
          ? 'bg-primary text-white shadow-[0_0_20px_rgba(0,102,255,0.35)]'
          : 'glass-premium text-white/70 hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

export function LeagueFilterBar({
  seasons,
  seasonId,
  onSeasonChange,
  rounds,
  upToRound,
  onRoundChange,
  className,
}: Props) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {seasons.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {seasons.map((s) => (
            <Pill
              key={s.id}
              active={s.id === seasonId}
              onClick={() => onSeasonChange(s.id)}
            >
              {seasonLabel(s)}
              {s.isActive ? ' · aktivna' : ''}
            </Pill>
          ))}
        </div>
      )}

      {rounds.length > 0 && (
        <div className="-mx-1 flex flex-wrap items-center gap-2 overflow-x-auto px-1 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
            Tabela:
          </span>
          <Pill active={upToRound == null} onClick={() => onRoundChange(null)}>
            Ukupno
          </Pill>
          {rounds.length > MANY_ROUNDS ? (
            <select
              value={upToRound ?? ''}
              onChange={(e) => onRoundChange(e.target.value ? Number(e.target.value) : null)}
              className="glass-premium rounded-full border-0 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/80"
              aria-label="Prikaz tabele po kolu"
            >
              <option value="">Ukupno</option>
              {rounds.map((r) => (
                <option key={r.id} value={r.number}>
                  Do {roundLabel(r)}
                </option>
              ))}
            </select>
          ) : (
            rounds.map((r) => (
              <Pill
                key={r.id}
                active={upToRound === r.number}
                onClick={() => onRoundChange(r.number)}
              >
                Do {roundLabel(r)}
              </Pill>
            ))
          )}
        </div>
      )}
    </div>
  );
}
