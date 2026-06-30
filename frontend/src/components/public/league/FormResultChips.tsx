import { Link } from 'react-router-dom';
import type { FormMatchEntry, FormResult } from '../../../lib/form-types';
import { formatDate } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

const RESULT_LABEL: Record<FormResult, string> = {
  W: 'Pobjeda',
  D: 'Neriješeno',
  L: 'Poraz',
};

const CHIP_CLASS: Record<FormResult, string> = {
  W: 'border-success/40 bg-success/20 text-success',
  D: 'border-amber-400/40 bg-amber-400/15 text-amber-300',
  L: 'border-danger/40 bg-danger/20 text-danger',
};

function fixtureLine(entry: FormMatchEntry, clubName: string) {
  return entry.isHome
    ? `${clubName} vs ${entry.opponentName}`
    : `${entry.opponentName} vs ${clubName}`;
}

function fixtureScore(entry: FormMatchEntry) {
  return entry.isHome
    ? `${entry.goalsFor}:${entry.goalsAgainst}`
    : `${entry.goalsAgainst}:${entry.goalsFor}`;
}

interface Props {
  form?: string;
  formMatches?: FormMatchEntry[];
  clubName?: string;
  size?: 'sm' | 'md';
  className?: string;
}

function entries(form?: string, formMatches?: FormMatchEntry[]): FormMatchEntry[] {
  if (formMatches?.length) return formMatches;
  if (!form) return [];
  return form.split('').map((ch, i) => ({
    result: ch as FormResult,
    matchId: `legacy-${i}`,
    scheduledAt: '',
    isHome: true,
    goalsFor: 0,
    goalsAgainst: 0,
    opponentName: '',
    opponentSlug: '',
  }));
}

export function FormResultChips({ form, formMatches, clubName, size = 'sm', className }: Props) {
  const list = entries(form, formMatches);
  if (!list.length) return <span className="text-text-muted">—</span>;

  const chipSize = size === 'md' ? 'h-8 w-8 text-xs' : 'h-7 w-7 text-[10px]';

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {list.map((entry, i) => {
        const hasDetail = Boolean(entry.opponentName && entry.matchId && !entry.matchId.startsWith('legacy'));
        const chip = (
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-lg border font-bold uppercase shadow-sm transition',
              chipSize,
              CHIP_CLASS[entry.result],
              hasDetail && 'cursor-help hover:brightness-110',
            )}
          >
            {entry.result}
          </span>
        );

        if (!hasDetail) {
          return <span key={`${entry.result}-${i}`}>{chip}</span>;
        }

        return (
          <span key={entry.matchId} className="group/chip relative">
            {chip}
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-[220px] -translate-x-1/2 opacity-0 transition duration-200 group-hover/chip:opacity-100"
            >
              <span className="glass-premium block rounded-xl border border-white/15 px-3 py-2 text-left shadow-xl">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary-light">
                  {RESULT_LABEL[entry.result]}
                </span>
                <span className="mt-1 block text-xs text-white/90">
                  {clubName ? fixtureLine(entry, clubName) : `vs ${entry.opponentName}`}
                </span>
                <span className="mt-0.5 block font-display text-sm font-bold text-white">
                  {fixtureScore(entry)}
                </span>
                {entry.scheduledAt && (
                  <span className="mt-1 block text-[10px] text-white/45">{formatDate(entry.scheduledAt)}</span>
                )}
                <Link
                  to={`/utakmice/${entry.matchId}`}
                  className="pointer-events-auto mt-2 inline-block text-[10px] font-semibold uppercase tracking-wider text-primary-light hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  Detalji utakmice →
                </Link>
              </span>
              <span className="absolute left-1/2 top-full -mt-px h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-white/15 bg-[rgba(10,21,37,0.95)]" />
            </span>
          </span>
        );
      })}
    </div>
  );
}
