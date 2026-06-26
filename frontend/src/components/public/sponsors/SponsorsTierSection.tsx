import type { Sponsor } from '../../../types';
import { SPONSOR_TIER_META, type SponsorTierKey } from '../../../lib/sponsor-tiers';
import { cn } from '../../../lib/utils';
import { SponsorLogoTile } from './SponsorLogoTile';

const GRID_CLASS = {
  hero: 'grid max-w-3xl gap-4 sm:gap-6',
  gold: 'grid gap-4 sm:grid-cols-2 sm:gap-6',
  silver: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
  bronze: 'grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  partner: 'grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
} as const;

const SECTION_CLASS = {
  hero: 'rounded-2xl bg-gradient-to-br from-primary via-primary to-slate-900 px-4 py-8 text-white sm:rounded-3xl sm:px-8 sm:py-12 md:px-12 md:py-16',
  gold: 'rounded-2xl border border-amber-100 bg-surface/50 px-4 py-8 sm:px-6 sm:py-10 dark:border-amber-500/25 dark:bg-surface/40',
  silver: 'px-0 py-6 sm:px-2 sm:py-8',
  bronze: 'px-0 py-5 sm:px-2 sm:py-6',
  partner: 'rounded-2xl border border-dashed border-[var(--border-subtle)] bg-surface/30 px-3 py-6 sm:px-4 sm:py-8',
} as const;

interface Props {
  tier: SponsorTierKey;
  sponsors: Sponsor[];
}

export function SponsorsTierSection({ tier, sponsors }: Props) {
  const meta = SPONSOR_TIER_META[tier];
  const isHero = meta.variant === 'hero';

  return (
    <section
      className={cn(
        SECTION_CLASS[meta.variant],
        isHero && 'mx-4 max-w-6xl sm:mx-auto sm:px-6',
      )}
    >
      <header className={cn('mb-6 text-center sm:mb-8', !isHero && 'mb-5 sm:mb-6')}>
        <p
          className={cn(
            'text-xs font-semibold uppercase tracking-[0.2em]',
            isHero ? 'text-white/70' : 'text-accent',
          )}
        >
          {meta.subtitle}
        </p>
        <h2
          className={cn(
            'mt-2 font-bold tracking-tight',
            isHero ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-xl text-text sm:text-2xl',
          )}
        >
          {meta.label}
        </h2>
        {!isHero && (
          <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-accent/40 to-transparent sm:mt-4" />
        )}
      </header>
      <div className={cn(GRID_CLASS[meta.variant], isHero && 'mx-auto w-full')}>
        {sponsors.map((s) => (
          <SponsorLogoTile key={s.id} sponsor={s} meta={meta} />
        ))}
      </div>
    </section>
  );
}
