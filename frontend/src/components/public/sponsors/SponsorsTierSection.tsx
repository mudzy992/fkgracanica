import type { Sponsor } from '../../../types';
import { SPONSOR_TIER_META, type SponsorTierKey } from '../../../lib/sponsor-tiers';
import { NewsSectionTitle } from '../../news/NewsSectionTitle';
import { Reveal } from '../../../lib/motion/Reveal';
import { cn } from '../../../lib/utils';
import { SponsorHeroCard } from './SponsorHeroCard';
import { SponsorLogoTile } from './SponsorLogoTile';

const GRID_CLASS = {
  hero: 'grid max-w-3xl gap-4 sm:gap-6',
  gold: 'grid gap-4 sm:grid-cols-2 sm:gap-6',
  silver: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
  bronze: 'grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  partner: 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
} as const;

interface Props {
  tier: SponsorTierKey;
  sponsors: Sponsor[];
}

export function SponsorsTierSection({ tier, sponsors }: Props) {
  const meta = SPONSOR_TIER_META[tier];
  const isHero = meta.variant === 'hero';

  if (isHero && sponsors.length === 1) {
    return (
      <Reveal>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SponsorHeroCard sponsor={sponsors[0]} />
        </div>
      </Reveal>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <Reveal>
        <NewsSectionTitle>{meta.label}</NewsSectionTitle>
        {meta.subtitle && (
          <p className="-mt-2 mb-6 text-center text-sm text-text-muted">{meta.subtitle}</p>
        )}
      </Reveal>
      <div className={cn(GRID_CLASS[meta.variant], isHero && 'mx-auto w-full max-w-3xl')}>
        {sponsors.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.04}>
            <SponsorLogoTile sponsor={s} meta={meta} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
