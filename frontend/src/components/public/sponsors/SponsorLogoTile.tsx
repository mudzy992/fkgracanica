import { mediaUrl } from '../../../lib/media';
import type { Sponsor } from '../../../types';
import type { SponsorTierMeta } from '../../../lib/sponsor-tiers';
import { cn } from '../../../lib/utils';

const TILE_STYLES = {
  hero: {
    wrap: 'rounded-2xl border border-white/10 bg-white/95 p-10 shadow-2xl backdrop-blur-sm dark:bg-slate-900/80',
    logo: 'h-24 max-h-28 w-full object-contain md:h-32',
    name: 'text-xl font-semibold tracking-tight text-text md:text-2xl',
  },
  gold: {
    wrap: 'rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-50/80 to-background p-8 shadow-sm dark:border-amber-500/20 dark:from-amber-950/30',
    logo: 'h-16 w-full object-contain',
    name: 'text-base font-semibold text-text',
  },
  silver: {
    wrap: 'rounded-xl border border-slate-200 bg-background p-6 shadow-sm dark:border-slate-700',
    logo: 'h-14 w-full object-contain',
    name: 'text-sm font-semibold text-text',
  },
  bronze: {
    wrap: 'rounded-lg border border-slate-200/80 bg-surface p-5 dark:border-slate-700',
    logo: 'h-12 w-full object-contain',
    name: 'text-sm font-medium text-text',
  },
  partner: {
    wrap: 'rounded-lg border border-slate-200/60 bg-background p-4 dark:border-slate-700/80',
    logo: 'h-10 w-full object-contain',
    name: 'text-xs font-medium text-text-muted',
  },
} as const;

interface Props {
  sponsor: Sponsor;
  meta: SponsorTierMeta;
}

export function SponsorLogoTile({ sponsor, meta }: Props) {
  const styles = TILE_STYLES[meta.variant];
  const inner = (
    <div className={cn('flex h-full flex-col items-center justify-center gap-3 text-center transition hover:scale-[1.02]', styles.wrap)}>
      {sponsor.logoPath ? (
        <img
          src={mediaUrl(sponsor.logoPath, meta.variant === 'hero' ? 'medium' : 'thumb')}
          alt={sponsor.name}
          className={styles.logo}
        />
      ) : (
        <span className={styles.name}>{sponsor.name}</span>
      )}
      {sponsor.logoPath && meta.variant !== 'partner' && (
        <span className={cn(styles.name, meta.variant === 'hero' ? '' : 'text-text-muted')}>{sponsor.name}</span>
      )}
    </div>
  );

  if (sponsor.url) {
    return (
      <a href={sponsor.url} target="_blank" rel="noreferrer" className="block h-full" title={sponsor.name}>
        {inner}
      </a>
    );
  }
  return inner;
}
