import type { Sponsor } from '../../../types';
import { SPONSOR_TIER_META, type SponsorTierKey } from '../../../lib/sponsor-tiers';
import { cn } from '../../../lib/utils';
import { SponsorLogoTile } from './SponsorLogoTile';

const GRID_CLASS = {
  hero: 'grid max-w-3xl gap-6',
  gold: 'grid gap-6 sm:grid-cols-2',
  silver: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3',
  bronze: 'grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  partner: 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
} as const;

const SECTION_CLASS = {
  hero: 'rounded-3xl bg-gradient-to-br from-primary via-primary to-slate-900 px-6 py-12 text-white md:px-12 md:py-16',
  gold: 'rounded-2xl border border-amber-100 bg-surface/50 px-6 py-10 dark:border-amber-900/30',
  silver: 'px-2 py-8',
  bronze: 'px-2 py-6',
  partner: 'rounded-2xl border border-dashed border-slate-200 bg-surface/30 px-4 py-8 dark:border-slate-700',
} as const;

interface Props {
  tier: SponsorTierKey;
  sponsors: Sponsor[];
}

export function SponsorsTierSection({ tier, sponsors }: Props) {
  const meta = SPONSOR_TIER_META[tier];
  const isHero = meta.variant === 'hero';

  return (
    <section className={cn(SECTION_CLASS[meta.variant], isHero ? 'mx-auto max-w-6xl px-4' : '')}>
      <header className={cn('mb-8 text-center', isHero ? '' : 'mb-6')}>
        <p className={cn('text-xs font-semibold uppercase tracking-[0.2em]', isHero ? 'text-white/70' : 'text-accent')}>
          {meta.subtitle}
        </p>
        <h2 className={cn('mt-2 font-bold tracking-tight', isHero ? 'text-3xl md:text-4xl' : 'text-2xl text-text')}>
          {meta.label}
        </h2>
        {!isHero && <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />}
      </header>
      <div className={cn(GRID_CLASS[meta.variant], isHero && 'mx-auto')}>
        {sponsors.map((s) => (
          <SponsorLogoTile key={s.id} sponsor={s} meta={meta} />
        ))}
      </div>
    </section>
  );
}
